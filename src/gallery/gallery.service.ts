import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { GalleryImage } from '@/database/entities/gallery-image.entity';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(
    @InjectRepository(GalleryImage)
    private readonly galleryImageRepository: Repository<GalleryImage>,
  ) {}

  findPublic(): Promise<GalleryImage[]> {
    this.logger.debug('Obteniendo fotos de la galería para vista pública');
    return this.galleryImageRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  findAllForAdmin(): Promise<GalleryImage[]> {
    this.logger.debug('Obteniendo todas las fotos de la galería para panel de administración');
    return this.galleryImageRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOneOrFail(id: number): Promise<GalleryImage> {
    const image = await this.galleryImageRepository.findOne({ where: { id } });
    if (!image) {
      this.logger.warn(`Foto de galería con id=${id} no encontrada`);
      throw new NotFoundException(`Foto de galería ${id} no encontrada`);
    }
    return image;
  }

  async create(dto: CreateGalleryImageDto, filePath: string): Promise<GalleryImage> {
    this.logger.log(`Creando foto de galería: ruta="${filePath}"`);
    const image = this.galleryImageRepository.create({
      filePath,
      displayOrder: dto.displayOrder ?? 0,
    });
    const saved = await this.galleryImageRepository.save(image);
    this.logger.log(`Foto de galería creada con id=${saved.id}`);
    return saved;
  }

  async update(id: number, dto: UpdateGalleryImageDto): Promise<GalleryImage> {
    this.logger.log(`Actualizando foto de galería id=${id}`);
    const image = await this.findOneOrFail(id);
    if (dto.displayOrder !== undefined) image.displayOrder = dto.displayOrder;
    const saved = await this.galleryImageRepository.save(image);
    this.logger.log(`Foto de galería id=${id} actualizada correctamente`);
    return saved;
  }

  /**
   * Las fotos de galería no tienen borrado lógico: se eliminan físicamente
   * la fila de la base de datos y el archivo en disco al mismo tiempo.
   */
  async remove(id: number): Promise<void> {
    this.logger.log(`Eliminando foto de galería id=${id}`);
    const image = await this.findOneOrFail(id);
    const uploadsDir = process.env.UPLOADS_DIR ?? './uploads';
    const fullPath = join(uploadsDir, image.filePath);

    try {
      await unlink(fullPath);
      this.logger.log(`Archivo eliminado del disco: ${fullPath}`);
    } catch (err) {
      // Si el archivo ya no existe en disco, no se bloquea la eliminación en la base de datos.
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.error(`Error al eliminar el archivo ${fullPath}`, (err as Error).stack);
        throw new BadRequestException('No se pudo eliminar el archivo de la foto');
      }
      this.logger.warn(`El archivo ${fullPath} ya no existía en disco, se procede a eliminar solo la fila`);
    }

    await this.galleryImageRepository.remove(image);
    this.logger.log(`Registro de foto de galería id=${id} eliminado de la base de datos`);
  }
}
