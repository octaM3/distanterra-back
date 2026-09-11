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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { PuntoInteres } from '@/database/entities/punto-interes.entity';
import { CreatePuntoInteresDto } from './dto/create-punto-interes.dto';
import { UpdatePuntoInteresDto } from './dto/update-punto-interes.dto';
import { PuntosInteresService } from './puntos-interes.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/puntos-interes')
export class PuntosInteresController {
  private readonly logger = new Logger(PuntosInteresController.name);

  constructor(private readonly puntosInteresService: PuntosInteresService) {}

  @Get()
  async findAll(): Promise<PuntoInteres[]> {
    this.logger.debug('GET /api/admin/puntos-interes');
    return this.puntosInteresService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PuntoInteres> {
    this.logger.debug(`GET /api/admin/puntos-interes/${id}`);
    return this.puntosInteresService.findOneOrFail(id);
  }

  @Post()
  async create(@Body() dto: CreatePuntoInteresDto): Promise<PuntoInteres> {
    this.logger.log(`POST /api/admin/puntos-interes - "${dto.nombre}"`);
    return this.puntosInteresService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePuntoInteresDto,
  ): Promise<PuntoInteres> {
    this.logger.log(`PATCH /api/admin/puntos-interes/${id}`);
    return this.puntosInteresService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/puntos-interes/${id}`);
    await this.puntosInteresService.remove(id);
    return { ok: true };
  }
}
