import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Experience } from '@/database/entities/experience.entity';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { ExperiencesService } from './experiences.service';

@Controller()
export class ExperiencesController {
  private readonly logger = new Logger(ExperiencesController.name);

  constructor(private readonly experiencesService: ExperiencesService) {}

  // ---- Endpoints públicos ----

  @Get('experiences')
  async findPublic(): Promise<Experience[]> {
    this.logger.debug('GET /api/experiences - vista pública');
    const experiences = await this.experiencesService.findPublic();
    this.logger.debug(`Devolviendo ${experiences.length} experiencia(s) activa(s)`);
    return experiences;
  }

  // ---- Endpoints de administración ----

  @UseGuards(JwtAuthGuard)
  @Get('admin/experiences')
  async findAllForAdmin(): Promise<Experience[]> {
    this.logger.debug('GET /api/admin/experiences');
    const experiences = await this.experiencesService.findAllForAdmin();
    this.logger.debug(`Devolviendo ${experiences.length} experiencia(s) totales`);
    return experiences;
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/experiences')
  async create(@Body() dto: CreateExperienceDto): Promise<Experience> {
    this.logger.log(`POST /api/admin/experiences - título ES: "${dto.titleEs}"`);
    return this.experiencesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/experiences/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExperienceDto,
  ): Promise<Experience> {
    this.logger.log(`PUT /api/admin/experiences/${id}`);
    return this.experiencesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/experiences/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/experiences/${id}`);
    await this.experiencesService.softRemove(id);
    return { ok: true };
  }
}
