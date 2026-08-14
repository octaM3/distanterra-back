import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experience } from '@/database/entities/experience.entity';
import { ExperienceDescriptionBlock } from '@/database/entities/experience-description-block';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

@Injectable()
export class ExperiencesService {
  private readonly logger = new Logger(ExperiencesService.name);

  constructor(
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
  ) {}

  findPublic(): Promise<Experience[]> {
    this.logger.debug('Obteniendo experiencias activas para vista pública');
    return this.experienceRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  findAllForAdmin(): Promise<Experience[]> {
    this.logger.debug('Obteniendo todas las experiencias para panel de administración');
    return this.experienceRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOneOrFail(id: number): Promise<Experience> {
    const experience = await this.experienceRepository.findOne({ where: { id } });
    if (!experience) {
      this.logger.warn(`Experiencia con id=${id} no encontrada`);
      throw new NotFoundException(`Experiencia ${id} no encontrada`);
    }
    return experience;
  }

  async create(dto: CreateExperienceDto): Promise<Experience> {
    this.logger.log(`Creando experiencia: ES="${dto.titleEs}" / EN="${dto.titleEn}"`);
    const experience = new Experience();
    experience.titleEs = dto.titleEs;
    experience.titleEn = dto.titleEn;
    experience.locationEs = dto.locationEs ?? null;
    experience.locationEn = dto.locationEn ?? null;
    experience.descriptionEs = dto.descriptionEs as ExperienceDescriptionBlock[];
    experience.descriptionEn = dto.descriptionEn as ExperienceDescriptionBlock[];
    experience.displayOrder = dto.displayOrder ?? 0;
    experience.isActive = dto.isActive ?? true;
    const saved = await this.experienceRepository.save(experience);
    this.logger.log(`Experiencia creada con id=${saved.id}`);
    return saved;
  }

  async update(id: number, dto: UpdateExperienceDto): Promise<Experience> {
    this.logger.log(`Actualizando experiencia id=${id}`);
    const experience = await this.findOneOrFail(id);

    if (dto.titleEs !== undefined) experience.titleEs = dto.titleEs;
    if (dto.titleEn !== undefined) experience.titleEn = dto.titleEn;
    if (dto.locationEs !== undefined) experience.locationEs = dto.locationEs;
    if (dto.locationEn !== undefined) experience.locationEn = dto.locationEn;
    if (dto.descriptionEs !== undefined)
      experience.descriptionEs = dto.descriptionEs as ExperienceDescriptionBlock[];
    if (dto.descriptionEn !== undefined)
      experience.descriptionEn = dto.descriptionEn as ExperienceDescriptionBlock[];
    if (dto.displayOrder !== undefined) experience.displayOrder = dto.displayOrder;
    if (dto.isActive !== undefined) experience.isActive = dto.isActive;

    const saved = await this.experienceRepository.save(experience);
    this.logger.log(`Experiencia id=${id} actualizada correctamente`);
    return saved;
  }

  /** Borrado lógico: establece deleted_at. La fila se conserva para auditoría. */
  async softRemove(id: number): Promise<void> {
    this.logger.log(`Borrado lógico de experiencia id=${id}`);
    const experience = await this.findOneOrFail(id);
    await this.experienceRepository.softRemove(experience);
    this.logger.log(`Experiencia id=${id} marcada como eliminada`);
  }
}
