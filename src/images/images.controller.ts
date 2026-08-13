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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppConfig } from '@/config/configuration';
import { Image } from '@/database/entities/image.entity';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { buildImageMulterOptions } from '@/common/utils/file-upload.util';
import { toPublicFileUrl } from '@/common/utils/public-url.util';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ImagesService } from './images.service';

interface ImageResponse extends Omit<Image, 'filePath'> {
  url: string;
}

@Controller()
export class ImagesController {
  private readonly logger = new Logger(ImagesController.name);

  constructor(
    private readonly imagesService: ImagesService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  /** Reemplaza la ruta relativa del archivo por una URL pública accesible. */
  private toResponse(image: Image): ImageResponse {
    const apiUrl = this.configService.get('apiUrl', { infer: true });
    const { filePath, ...rest } = image;
    return { ...rest, url: toPublicFileUrl(apiUrl, filePath) as string };
  }

  // ---- Endpoints públicos ----

  @Get('images')
  async findPublic(): Promise<ImageResponse[]> {
    this.logger.debug('GET /api/images - vista pública');
    const images = await this.imagesService.findPublic();
    this.logger.debug(`Devolviendo ${images.length} imagen(es)`);
    return images.map((img) => this.toResponse(img));
  }

  // ---- Endpoints de administración ----

  @UseGuards(JwtAuthGuard)
  @Get('admin/images')
  async findAllForAdmin(): Promise<ImageResponse[]> {
    this.logger.debug('GET /api/admin/images');
    const images = await this.imagesService.findAllForAdmin();
    this.logger.debug(`Devolviendo ${images.length} imagen(es) totales`);
    return images.map((img) => this.toResponse(img));
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/images')
  @UseInterceptors(FileInterceptor('image', buildImageMulterOptions('logos')))
  async create(
    @Body() dto: CreateImageDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<ImageResponse> {
    if (!file) {
      this.logger.warn('POST /api/admin/images - no se adjuntó ningún archivo');
      throw new BadRequestException('Debe adjuntar un archivo de imagen');
    }
    this.logger.log(`POST /api/admin/images - archivo: ${file.filename}`);
    const image = await this.imagesService.create(dto, `logos/${file.filename}`);
    return this.toResponse(image);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/images/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateImageDto,
  ): Promise<ImageResponse> {
    this.logger.log(`PUT /api/admin/images/${id}`);
    const image = await this.imagesService.update(id, dto);
    return this.toResponse(image);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/images/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/images/${id}`);
    await this.imagesService.remove(id);
    return { ok: true };
  }
}
