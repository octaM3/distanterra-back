import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '@/database/entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  findAll(): Promise<Company[]> {
    this.logger.debug('Obteniendo todas las empresas');
    return this.companyRepository.find({ order: { name: 'ASC' } });
  }

  async findOneOrFail(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      this.logger.warn(`Empresa con id=${id} no encontrada`);
      throw new NotFoundException(`Empresa ${id} no encontrada`);
    }
    return company;
  }

  async create(dto: CreateCompanyDto): Promise<Company> {
    this.logger.log(`Creando empresa: "${dto.name}"`);
    const company = this.companyRepository.create(dto);
    const saved = await this.companyRepository.save(company);
    this.logger.log(`Empresa creada con id=${saved.id}`);
    return saved;
  }

  async update(id: number, dto: UpdateCompanyDto): Promise<Company> {
    this.logger.log(`Actualizando empresa id=${id}`);
    const company = await this.findOneOrFail(id);
    Object.assign(company, dto);
    const saved = await this.companyRepository.save(company);
    this.logger.log(`Empresa id=${id} actualizada correctamente`);
    return saved;
  }

  async softRemove(id: number): Promise<void> {
    this.logger.log(`Eliminando (soft) empresa id=${id}`);
    const company = await this.findOneOrFail(id);
    const campaignsCount = await this.companyRepository.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('campaigns', 'c')
      .where('c.company_id = :id', { id })
      .andWhere('c.deleted_at IS NULL')
      .getRawOne<{ count: string }>();
    if (campaignsCount && parseInt(campaignsCount.count, 10) > 0) {
      throw new BadRequestException(
        'No se puede eliminar la empresa: tiene campañas asociadas. Elimine o reasigne las campañas primero.',
      );
    }
    await this.companyRepository.softRemove(company);
    this.logger.log(`Empresa id=${id} eliminada correctamente`);
  }
}
