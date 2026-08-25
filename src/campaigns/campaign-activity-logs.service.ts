import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignActivityLog } from '@/database/entities/campaign-activity-log.entity';
import { CampaignsService } from './campaigns.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';

@Injectable()
export class CampaignActivityLogsService {
  private readonly logger = new Logger(CampaignActivityLogsService.name);

  constructor(
    @InjectRepository(CampaignActivityLog)
    private readonly campaignActivityLogRepository: Repository<CampaignActivityLog>,
    private readonly campaignsService: CampaignsService,
  ) {}

  async findOneOrFail(campaignId: number, id: number): Promise<CampaignActivityLog> {
    const log = await this.campaignActivityLogRepository.findOne({ where: { id, campaignId } });
    if (!log) {
      this.logger.warn(`Actividad de campaña id=${id} (campaña ${campaignId}) no encontrada`);
      throw new NotFoundException(`Actividad de campaña ${id} no encontrada`);
    }
    return log;
  }

  async create(
    campaignId: number,
    dto: CreateActivityLogDto,
    createdBy: number,
  ): Promise<CampaignActivityLog> {
    await this.campaignsService.assertCampaignEditable(campaignId);
    this.logger.log(`Creando actividad para campaña ${campaignId}, fecha ${dto.logDate}`);
    const log = this.campaignActivityLogRepository.create({ ...dto, campaignId, createdBy });
    return this.campaignActivityLogRepository.save(log);
  }

  async update(
    campaignId: number,
    id: number,
    dto: UpdateActivityLogDto,
  ): Promise<CampaignActivityLog> {
    await this.campaignsService.assertCampaignEditable(campaignId);
    const log = await this.findOneOrFail(campaignId, id);
    Object.assign(log, dto);
    this.logger.log(`Actualizando actividad de campaña id=${id}`);
    return this.campaignActivityLogRepository.save(log);
  }

  async remove(campaignId: number, id: number): Promise<void> {
    await this.campaignsService.assertCampaignEditable(campaignId);
    const log = await this.findOneOrFail(campaignId, id);
    this.logger.log(`Eliminando actividad de campaña id=${id} (campaña ${campaignId})`);
    await this.campaignActivityLogRepository.softRemove(log);
  }
}
