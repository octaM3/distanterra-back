import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { buildKmzMemoryMulterOptions } from '@/common/utils/file-upload.util';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { TrackingsService, TrackingView } from './trackings.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/trackings')
export class TrackingsController {
  private readonly logger = new Logger(TrackingsController.name);

  constructor(private readonly trackingsService: TrackingsService) {}

  @Get()
  async findAll(): Promise<TrackingView[]> {
    this.logger.debug('GET /api/admin/trackings');
    return this.trackingsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TrackingView> {
    this.logger.debug(`GET /api/admin/trackings/${id}`);
    return this.trackingsService.findOneOrFail(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', buildKmzMemoryMulterOptions()))
  async create(
    @Body() dto: CreateTrackingDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<TrackingView> {
    this.logger.log(`POST /api/admin/trackings - "${dto.nombre}"`);
    return this.trackingsService.create(dto, file);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrackingDto,
  ): Promise<TrackingView> {
    this.logger.log(`PATCH /api/admin/trackings/${id}`);
    return this.trackingsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/trackings/${id}`);
    await this.trackingsService.remove(id);
    return { ok: true };
  }
}
