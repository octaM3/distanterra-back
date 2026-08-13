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
import { Image } from '@/database/entities/image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  findPublic(): Promise<Image[]> {
    this.logger.debug('Obteniendo imágenes para vista pública');
    return this.imageRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  findAllForAdmin(): Promise<Image[]> {
    this.logger.debug('Obteniendo todas las imágenes para panel de administración');
    return this.imageRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOneOrFail(id: number): Promise<Image> {
    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) {
      this.logger.warn(`Imagen con id=${id} no encontrada`);
      throw new NotFoundException(`Imagen ${id} no encontrada`);
    }
    return image;
  }

  async create(dto: CreateImageDto, filePath: string): Promise<Image> {
    this.logger.log(`Creando imagen: ruta="${filePath}"`);
    const image = this.imageRepository.create({
      filePath,
      altTextEs: dto.altTextEs ?? null,
      altTextEn: dto.altTextEn ?? null,
      displayOrder: dto.displayOrder ?? 0,
    });
    const saved = await this.imageRepository.save(image);
    this.logger.log(`Imagen creada con id=${saved.id}`);
    return saved;
  }

  async update(id: number, dto: UpdateImageDto): Promise<Image> {
    this.logger.log(`Actualizando imagen id=${id}`);
    const image = await this.findOneOrFail(id);
    if (dto.altTextEs !== undefined) image.altTextEs = dto.altTextEs;
    if (dto.altTextEn !== undefined) image.altTextEn = dto.altTextEn;
    if (dto.displayOrder !== undefined) image.displayOrder = dto.displayOrder;
    const saved = await this.imageRepository.save(image);
    this.logger.log(`Imagen id=${id} actualizada correctamente`);
    return saved;
  }

  /**
   * Las imágenes no tienen borrado lógico: se eliminan físicamente la fila
   * de la base de datos y el archivo en disco al mismo tiempo.
   */
  async remove(id: number): Promise<void> {
    this.logger.log(`Eliminando imagen id=${id}`);
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
        throw new BadRequestException('No se pudo eliminar el archivo de la imagen');
      }
      this.logger.warn(`El archivo ${fullPath} ya no existía en disco, se procede a eliminar solo la fila`);
    }

    await this.imageRepository.remove(image);
    this.logger.log(`Registro de imagen id=${id} eliminado de la base de datos`);
  }
}
