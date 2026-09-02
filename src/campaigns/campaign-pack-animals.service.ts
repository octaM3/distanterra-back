import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignPackAnimal } from '@/database/entities/campaign-pack-animal.entity';
import { validateAssignmentDateRange } from './campaigns.util';
import { CampaignsService } from './campaigns.service';
import { AssignPackAnimalDto } from './dto/assign-pack-animal.dto';
import { UpdateCampaignPackAnimalDto } from './dto/update-campaign-pack-animal.dto';

@Injectable()
export class CampaignPackAnimalsService {
  private readonly logger = new Logger(CampaignPackAnimalsService.name);

  constructor(
    @InjectRepository(CampaignPackAnimal)
    private readonly campaignPackAnimalRepository: Repository<CampaignPackAnimal>,
    private readonly campaignsService: CampaignsService,
  ) {}

  async findOneOrFail(campaignId: number, id: number): Promise<CampaignPackAnimal> {
    const row = await this.campaignPackAnimalRepository.findOne({ where: { id, campaignId } });
    if (!row) {
      this.logger.warn(`Animal de carga de campaña id=${id} (campaña ${campaignId}) no encontrado`);
      throw new NotFoundException(`Animal de carga de campaña ${id} no encontrado`);
    }
    return row;
  }

  // Los animales de carga no son un catálogo: tipo de animal, precio por
  // día y % de impuestos se cargan directamente en el formulario al
  // asignarlos a la campaña (ver computeGuideCost, misma fórmula que
  // campaign_guides). Sin chequeo de disponibilidad: no son un bien propio
  // con cantidad limitada.
  async assign(campaignId: number, dto: AssignPackAnimalDto): Promise<CampaignPackAnimal> {
    const campaign = await this.campaignsService.assertCampaignEditable(campaignId);

    validateAssignmentDateRange(campaign, dto.startDate, dto.endDate);

    this.logger.log(
      `Asignando ${dto.quantity} "${dto.animalType}"(s) a la campaña ${campaignId} (${dto.startDate} a ${dto.endDate})`,
    );
    const row = this.campaignPackAnimalRepository.create({
      campaignId,
      animalType: dto.animalType,
      quantity: dto.quantity,
      manualCost: dto.manualCost ?? null,
      pricePerDay: dto.pricePerDay ?? null,
      taxPercentage: dto.taxPercentage ?? null,
      startDate: dto.startDate,
      endDate: dto.endDate,
      notes: dto.notes ?? null,
    });
    return this.campaignPackAnimalRepository.save(row);
  }

  async update(
    campaignId: number,
    id: number,
    dto: UpdateCampaignPackAnimalDto,
  ): Promise<CampaignPackAnimal> {
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

    if (dto.animalType !== undefined) row.animalType = dto.animalType;
    if (dto.quantity !== undefined) row.quantity = dto.quantity;
    if (dto.pricePerDay !== undefined) row.pricePerDay = dto.pricePerDay;
    if (dto.taxPercentage !== undefined) row.taxPercentage = dto.taxPercentage;
    if (dto.manualCost !== undefined) row.manualCost = dto.manualCost;
    if (dto.notes !== undefined) row.notes = dto.notes;

    this.logger.log(`Actualizando animal de carga de campaña id=${id}`);
    return this.campaignPackAnimalRepository.save(row);
  }

  async remove(campaignId: number, id: number): Promise<void> {
    await this.campaignsService.assertCampaignEditable(campaignId);
    const row = await this.findOneOrFail(campaignId, id);
    this.logger.log(`Liberando animal de carga de campaña id=${id} (campaña ${campaignId})`);
    await this.campaignPackAnimalRepository.softRemove(row);
  }
}
