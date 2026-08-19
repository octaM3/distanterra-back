import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppConfig } from '@/config/configuration';
import { GalleryImage } from '@/database/entities/gallery-image.entity';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { buildImageMemoryMulterOptions } from '@/common/utils/file-upload.util';
import { optimizeAndSaveImage } from '@/common/utils/image-optimizer.util';
import { toPublicFileUrl } from '@/common/utils/public-url.util';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { GalleryPaginationDto } from './dto/gallery-pagination.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
import { GalleryService } from './gallery.service';

interface GalleryImageResponse extends Omit<GalleryImage, 'filePath'> {
  url: string;
}

interface GalleryPageResponse {
  items: GalleryImageResponse[];
  hasMore: boolean;
}

@Controller()
export class GalleryController {
  private readonly logger = new Logger(GalleryController.name);

  constructor(
    private readonly galleryService: GalleryService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  /** Reemplaza la ruta relativa del archivo por una URL pública accesible. */
  private toResponse(image: GalleryImage): GalleryImageResponse {
    const apiUrl = this.configService.get('apiUrl', { infer: true });
    const { filePath, ...rest } = image;
    return { ...rest, url: toPublicFileUrl(apiUrl, filePath) as string };
  }

  // ---- Endpoints públicos ----

  @Get('gallery')
  async findPublic(@Query() query: GalleryPaginationDto): Promise<GalleryPageResponse> {
    const offset = query.offset ?? 0;
    const limit = query.limit ?? 16;
    this.logger.debug(`GET /api/gallery - vista pública (offset=${offset}, limit=${limit})`);
    const { items, hasMore } = await this.galleryService.findPublic(offset, limit);
    this.logger.debug(`Devolviendo ${items.length} foto(s), hasMore=${hasMore}`);
    return { items: items.map((img) => this.toResponse(img)), hasMore };
  }

  // ---- Endpoints de administración ----

  @UseGuards(JwtAuthGuard)
  @Get('admin/gallery')
  async findAllForAdmin(): Promise<GalleryImageResponse[]> {
    this.logger.debug('GET /api/admin/gallery');
    const images = await this.galleryService.findAllForAdmin();
    this.logger.debug(`Devolviendo ${images.length} foto(s) totales`);
    return images.map((img) => this.toResponse(img));
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/gallery')
  @UseInterceptors(FileInterceptor('image', buildImageMemoryMulterOptions()))
  async create(
    @Body() dto: CreateGalleryImageDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<GalleryImageResponse> {
    if (!file) {
      this.logger.warn('POST /api/admin/gallery - no se adjuntó ningún archivo');
      throw new BadRequestException('Debe adjuntar un archivo de imagen');
    }
    this.logger.log(`POST /api/admin/gallery - archivo: "${file.originalname}"`);
    const filePath = await optimizeAndSaveImage(file, 'gallery');
    const image = await this.galleryService.create(dto, filePath);
    return this.toResponse(image);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/gallery/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGalleryImageDto,
  ): Promise<GalleryImageResponse> {
    this.logger.log(`PUT /api/admin/gallery/${id}`);
    const image = await this.galleryService.update(id, dto);
    return this.toResponse(image);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/gallery/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/gallery/${id}`);
    await this.galleryService.remove(id);
    return { ok: true };
  }
}
