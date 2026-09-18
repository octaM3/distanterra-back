import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { AppConfig } from '@/config/configuration';
import { saveRawFile } from '@/common/utils/file-upload.util';
import { TrackStats, parseKmzTrack } from '@/common/utils/kml-parser.util';
import { toFileUrl } from '@/common/utils/file-url.util';
import { Tracking } from '@/database/entities/tracking.entity';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';

const KMZ_SUBFOLDER = 'trackings';

export interface TrackingView {
  id: number;
  nombre: string;
  descripcion: string | null;
  /** Hexadecimal "#rrggbb", o null si nunca se eligió uno (el front asigna el automático). */
  color: string | null;
  /** Métricas calculadas del recorrido. Null en los trackings todavía sin reprocesar. */
  stats: TrackStats | null;
  /** Datos crudos del archivo (tiempo en movimiento, velocidad máxima, clima). */
  deviceInfo: string | null;
  points: [number, number][];
  fileUrl: string | null;
  createdAt: Date;
}

@Injectable()
export class TrackingsService {
  private readonly logger = new Logger(TrackingsService.name);

  constructor(
    @InjectRepository(Tracking)
    private readonly trackingRepository: Repository<Tracking>,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  private toView(tracking: Tracking): TrackingView {
    const apiUrl = this.configService.get('apiUrl', { infer: true });
    return {
      id: tracking.id,
      nombre: tracking.nombre,
      descripcion: tracking.descripcion,
      color: tracking.color,
      stats: tracking.stats,
      deviceInfo: tracking.deviceInfo,
      points: tracking.points,
      fileUrl: toFileUrl(apiUrl, tracking.filePath),
      createdAt: tracking.createdAt,
    };
  }

  async findAll(): Promise<TrackingView[]> {
    this.logger.debug('Obteniendo todos los trackings');
    const trackings = await this.trackingRepository.find({ order: { createdAt: 'DESC' } });
    return trackings.map((t) => this.toView(t));
  }

  private async findEntityOrFail(id: number): Promise<Tracking> {
    const tracking = await this.trackingRepository.findOne({ where: { id } });
    if (!tracking) {
      this.logger.warn(`Tracking con id=${id} no encontrado`);
      throw new NotFoundException(`Tracking ${id} no encontrado`);
    }
    return tracking;
  }

  async findOneOrFail(id: number): Promise<TrackingView> {
    return this.toView(await this.findEntityOrFail(id));
  }

  async create(
    dto: CreateTrackingDto,
    file: Express.Multer.File | undefined,
  ): Promise<TrackingView> {
    if (!file) {
      throw new BadRequestException('Debe subir un archivo .kmz.');
    }

    const { points, suggestedName, stats, deviceInfo } = parseKmzTrack(file.buffer);
    this.logger.log(
      `Parseando tracking "${dto.nombre}": ${points.length} punto(s)` +
        (suggestedName ? ` (nombre sugerido del KML: "${suggestedName}")` : ''),
    );

    const filePath = await saveRawFile(file, KMZ_SUBFOLDER);

    const tracking = this.trackingRepository.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      color: dto.color ?? null,
      stats,
      deviceInfo,
      points,
      filePath,
    });
    const saved = await this.trackingRepository.save(tracking);
    this.logger.log(`Tracking creado con id=${saved.id}`);
    return this.toView(saved);
  }

  async update(id: number, dto: UpdateTrackingDto): Promise<TrackingView> {
    const tracking = await this.findEntityOrFail(id);
    if (dto.nombre !== undefined) tracking.nombre = dto.nombre;
    if (dto.descripcion !== undefined) tracking.descripcion = dto.descripcion;
    if (dto.color !== undefined) tracking.color = dto.color;
    const saved = await this.trackingRepository.save(tracking);
    this.logger.log(`Tracking id=${id} actualizado correctamente`);
    return this.toView(saved);
  }

  async remove(id: number): Promise<void> {
    const tracking = await this.findEntityOrFail(id);
    this.logger.log(`Eliminando tracking id=${id}`);
    await this.trackingRepository.remove(tracking);

    const uploadsDir = process.env.UPLOADS_DIR ?? './uploads';
    try {
      await unlink(join(uploadsDir, tracking.filePath));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(
          `No se pudo eliminar el archivo ${tracking.filePath}: ${(err as Error).message}`,
        );
      }
    }
  }
}
