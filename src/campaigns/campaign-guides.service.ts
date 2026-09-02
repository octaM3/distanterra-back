import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignGuide } from '@/database/entities/campaign-guide.entity';
import { validateAssignmentDateRange } from './campaigns.util';
import { CampaignsService } from './campaigns.service';
import { AssignGuideDto } from './dto/assign-guide.dto';
import { UpdateCampaignGuideDto } from './dto/update-campaign-guide.dto';

@Injectable()
export class CampaignGuidesService {
  private readonly logger = new Logger(CampaignGuidesService.name);

  constructor(
    @InjectRepository(CampaignGuide)
    private readonly campaignGuideRepository: Repository<CampaignGuide>,
    private readonly campaignsService: CampaignsService,
  ) {}

  async findOneOrFail(campaignId: number, id: number): Promise<CampaignGuide> {
    const row = await this.campaignGuideRepository.findOne({ where: { id, campaignId } });
    if (!row) {
      this.logger.warn(`Baqueanos de campaña id=${id} (campaña ${campaignId}) no encontrados`);
      throw new NotFoundException(`Baqueanos de campaña ${id} no encontrados`);
    }
    return row;
  }

  // Los baqueanos no son un catálogo: precio por día y % de impuestos se
  // cargan directamente en el formulario al agregarlos a la campaña (ver
  // computeGuideCost).
  async assign(campaignId: number, dto: AssignGuideDto): Promise<CampaignGuide> {
    const campaign = await this.campaignsService.assertCampaignEditable(campaignId);

    validateAssignmentDateRange(campaign, dto.startDate, dto.endDate);

    this.logger.log(
      `Agregando ${dto.quantity} baqueano(s) a la campaña ${campaignId} (${dto.startDate} a ${dto.endDate})`,
    );
    const row = this.campaignGuideRepository.create({
      campaignId,
      quantity: dto.quantity,
      manualCost: dto.manualCost ?? null,
      pricePerDay: dto.pricePerDay ?? null,
      taxPercentage: dto.taxPercentage ?? null,
      startDate: dto.startDate,
      endDate: dto.endDate,
      notes: dto.notes ?? null,
    });
    return this.campaignGuideRepository.save(row);
  }

  async update(
    campaignId: number,
    id: number,
    dto: UpdateCampaignGuideDto,
  ): Promise<CampaignGuide> {
    const campaign = await this.campaignsService.assertCampaignEditable(campaignId);
    const row = await this.findOneOrFail(campaignId, id);

    const nextStart = dto.startDate ?? row.startDate;
    const nextEnd = dto.endDate ?? row.endDate;
    const datesChanged = nextStart !== row.startDate || nextEnd !== row.endDate;

    if (datesChanged) {
      validateAssignmentDateRange(campaign, nextStart, nextEnd);
      row.startDate = nextStart;
      row.endDate = nextEnd;
    }

    if (dto.quantity !== undefined) row.quantity = dto.quantity;
    if (dto.pricePerDay !== undefined) row.pricePerDay = dto.pricePerDay;
    if (dto.taxPercentage !== undefined) row.taxPercentage = dto.taxPercentage;
    if (dto.manualCost !== undefined) row.manualCost = dto.manualCost;
    if (dto.notes !== undefined) row.notes = dto.notes;

    this.logger.log(`Actualizando baqueanos de campaña id=${id}`);
    return this.campaignGuideRepository.save(row);
  }

  async remove(campaignId: number, id: number): Promise<void> {
    await this.campaignsService.assertCampaignEditable(campaignId);
    const row = await this.findOneOrFail(campaignId, id);
    this.logger.log(`Quitando baqueanos de campaña id=${id} (campaña ${campaignId})`);
    await this.campaignGuideRepository.softRemove(row);
  }
}
