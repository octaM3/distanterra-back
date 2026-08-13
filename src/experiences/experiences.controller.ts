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

interface ExperienceResponse extends Omit<Experience, 'bosses'> {
  bosses: string[];
}

@Controller()
export class ExperiencesController {
  private readonly logger = new Logger(ExperiencesController.name);

  constructor(private readonly experiencesService: ExperiencesService) {}

  /** Aplana la lista de objetos ExperienceBoss a un arreglo de strings con solo el nombre. */
  private toResponse(experience: Experience): ExperienceResponse {
    const { bosses, ...rest } = experience;
    return { ...rest, bosses: (bosses ?? []).map((b) => b.name) };
  }

  // ---- Endpoints públicos ----

  @Get('experiences')
  async findPublic(): Promise<ExperienceResponse[]> {
    this.logger.debug('GET /api/experiences - vista pública');
    const experiences = await this.experiencesService.findPublic();
    this.logger.debug(`Devolviendo ${experiences.length} experiencia(s) activa(s)`);
    return experiences.map((e) => this.toResponse(e));
  }

  // ---- Endpoints de administración ----

  @UseGuards(JwtAuthGuard)
  @Get('admin/experiences')
  async findAllForAdmin(): Promise<ExperienceResponse[]> {
    this.logger.debug('GET /api/admin/experiences');
    const experiences = await this.experiencesService.findAllForAdmin();
    this.logger.debug(`Devolviendo ${experiences.length} experiencia(s) totales`);
    return experiences.map((e) => this.toResponse(e));
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/experiences')
  async create(@Body() dto: CreateExperienceDto): Promise<ExperienceResponse> {
    this.logger.log(`POST /api/admin/experiences - título ES: "${dto.titleEs}"`);
    const experience = await this.experiencesService.create(dto);
    return this.toResponse(experience);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/experiences/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExperienceDto,
  ): Promise<ExperienceResponse> {
    this.logger.log(`PUT /api/admin/experiences/${id}`);
    const experience = await this.experiencesService.update(id, dto);
    return this.toResponse(experience);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/experiences/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/experiences/${id}`);
    await this.experiencesService.softRemove(id);
    return { ok: true };
  }
}
