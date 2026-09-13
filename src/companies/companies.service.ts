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
    // El nombre identifica a la empresa en campañas, gestión y facturas ya
    // emitidas: se edita todo lo demás, pero el nombre queda fijo.
    const { name: _ignoredName, ...editable } = dto;
    Object.assign(company, editable);
    const saved = await this.companyRepository.save(company);
    this.logger.log(`Empresa id=${id} actualizada correctamente`);
    return saved;
  }

  /** Cuántas filas vigentes de `table` referencian a esta empresa. */
  private async countLinked(table: string, id: number): Promise<number> {
    const row = await this.companyRepository.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from(table, 't')
      .where('t.company_id = :id', { id })
      .andWhere('t.deleted_at IS NULL')
      .getRawOne<{ count: string }>();
    return row ? parseInt(row.count, 10) : 0;
  }

  async softRemove(id: number): Promise<void> {
    this.logger.log(`Eliminando (soft) empresa id=${id}`);
    const company = await this.findOneOrFail(id);

    // Una empresa referenciada no se elimina: dejaría campañas, ítems de
    // gestión o facturas ya emitidas apuntando a alguien que no existe.
    const linked: { table: string; label: string }[] = [
      { table: 'campaigns', label: 'campañas o servicios' },
      { table: 'service_records', label: 'ítems de gestión' },
      { table: 'financial_documents', label: 'archivos (facturas o recibos)' },
    ];
    for (const { table, label } of linked) {
      if ((await this.countLinked(table, id)) > 0) {
        throw new BadRequestException(
          `No se puede eliminar la empresa: tiene ${label} asociados.`,
        );
      }
    }

    await this.companyRepository.softRemove(company);
    this.logger.log(`Empresa id=${id} eliminada correctamente`);
  }
}
