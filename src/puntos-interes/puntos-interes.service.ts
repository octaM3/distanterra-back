import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PuntoInteres } from '@/database/entities/punto-interes.entity';
import { CreatePuntoInteresDto } from './dto/create-punto-interes.dto';
import { UpdatePuntoInteresDto } from './dto/update-punto-interes.dto';

@Injectable()
export class PuntosInteresService {
  private readonly logger = new Logger(PuntosInteresService.name);

  constructor(
    @InjectRepository(PuntoInteres)
    private readonly puntoInteresRepository: Repository<PuntoInteres>,
  ) {}

  findAll(): Promise<PuntoInteres[]> {
    this.logger.debug('Obteniendo todos los puntos de interés');
    return this.puntoInteresRepository.find({ order: { createdAt: 'ASC' } });
  }

  async findOneOrFail(id: number): Promise<PuntoInteres> {
    const punto = await this.puntoInteresRepository.findOne({ where: { id } });
    if (!punto) {
      this.logger.warn(`Punto de interés con id=${id} no encontrado`);
      throw new NotFoundException(`Punto de interés ${id} no encontrado`);
    }
    return punto;
  }

  async create(dto: CreatePuntoInteresDto): Promise<PuntoInteres> {
    this.logger.log(`Creando punto de interés: "${dto.nombre}" (${dto.categoria})`);
    const punto = this.puntoInteresRepository.create({
      nombre: dto.nombre,
      telefono: dto.telefono ?? null,
      comentario: dto.comentario ?? null,
      categoria: dto.categoria,
      pais: dto.pais ?? null,
      provincia: dto.provincia ?? null,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
    const saved = await this.puntoInteresRepository.save(punto);
    this.logger.log(`Punto de interés creado con id=${saved.id}`);
    return saved;
  }

  async update(id: number, dto: UpdatePuntoInteresDto): Promise<PuntoInteres> {
    this.logger.log(`Actualizando punto de interés id=${id}`);
    const punto = await this.findOneOrFail(id);

    if (dto.nombre !== undefined) punto.nombre = dto.nombre;
    if (dto.telefono !== undefined) punto.telefono = dto.telefono;
    if (dto.comentario !== undefined) punto.comentario = dto.comentario;
    if (dto.categoria !== undefined) punto.categoria = dto.categoria;
    if (dto.pais !== undefined) punto.pais = dto.pais;
    if (dto.provincia !== undefined) punto.provincia = dto.provincia;
    if (dto.latitude !== undefined) punto.latitude = dto.latitude;
    if (dto.longitude !== undefined) punto.longitude = dto.longitude;

    const saved = await this.puntoInteresRepository.save(punto);
    this.logger.log(`Punto de interés id=${id} actualizado correctamente`);
    return saved;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Eliminando punto de interés id=${id}`);
    const punto = await this.findOneOrFail(id);
    await this.puntoInteresRepository.remove(punto);
    this.logger.log(`Punto de interés id=${id} eliminado`);
  }
}
