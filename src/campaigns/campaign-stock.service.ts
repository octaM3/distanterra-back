import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignStockItem } from '@/database/entities/campaign-stock-item.entity';
import { StockItemsService } from '@/stock-items/stock-items.service';
import { validateAssignmentDateRange } from './campaigns.util';
import { CampaignsService } from './campaigns.service';
import { AssignStockItemDto } from './dto/assign-stock-item.dto';
import { UpdateCampaignStockItemDto } from './dto/update-campaign-stock-item.dto';

@Injectable()
export class CampaignStockService {
  private readonly logger = new Logger(CampaignStockService.name);

  constructor(
    @InjectRepository(CampaignStockItem)
    private readonly campaignStockItemRepository: Repository<CampaignStockItem>,
    private readonly campaignsService: CampaignsService,
    private readonly stockItemsService: StockItemsService,
  ) {}

  async findOneOrFail(campaignId: number, id: number): Promise<CampaignStockItem> {
    const row = await this.campaignStockItemRepository.findOne({ where: { id, campaignId } });
    if (!row) {
      this.logger.warn(`Ítem de stock de campaña id=${id} (campaña ${campaignId}) no encontrado`);
      throw new NotFoundException(`Ítem de stock de campaña ${id} no encontrado`);
    }
    return row;
  }

  async assign(campaignId: number, dto: AssignStockItemDto): Promise<CampaignStockItem> {
    const campaign = await this.campaignsService.assertCampaignEditable(campaignId);
    const stockItem = await this.stockItemsService.findOneOrFail(dto.stockItemId);

    validateAssignmentDateRange(campaign, dto.startDate, dto.endDate);

    // La disponibilidad se chequea solo contra la ventana de uso pedida: el
    // mismo ítem puede estar asignado a otra campaña siempre que no se
    // superponga con estas fechas (ver getAvailableQuantity).
    const available = await this.stockItemsService.getAvailableQuantity(
      dto.stockItemId,
      dto.startDate,
      dto.endDate,
    );
    if (dto.quantity > available) {
      throw new BadRequestException(
        `Cantidad no disponible: quedan ${available} unidad(es) de "${stockItem.name}" libres (de ${stockItem.totalQuantity} en total) para el ${dto.startDate} a ${dto.endDate}.`,
      );
    }

    this.logger.log(
      `Asignando ${dto.quantity} unidad(es) de "${stockItem.name}" a la campaña ${campaignId} (${dto.startDate} a ${dto.endDate})`,
    );
    const row = this.campaignStockItemRepository.create({
      campaignId,
      stockItemId: dto.stockItemId,
      quantity: dto.quantity,
      noCost: dto.noCost ?? false,
      manualCost: dto.manualCost ?? null,
      pricePerDay: stockItem.pricePerDay,
      pricePerMonth: stockItem.pricePerMonth,
      startDate: dto.startDate,
      endDate: dto.endDate,
      notes: dto.notes ?? null,
    });
    return this.campaignStockItemRepository.save(row);
  }

  async update(
    campaignId: number,
    id: number,
    dto: UpdateCampaignStockItemDto,
  ): Promise<CampaignStockItem> {
    const campaign = await this.campaignsService.assertCampaignEditable(campaignId);
    const row = await this.findOneOrFail(campaignId, id);

    const nextQuantity = dto.quantity ?? row.quantity;
    const nextStart = dto.startDate ?? row.startDate;
    const nextEnd = dto.endDate ?? row.endDate;
    const datesChanged = nextStart !== row.startDate || nextEnd !== row.endDate;

    if (datesChanged) {
      validateAssignmentDateRange(campaign, nextStart, nextEnd);
    }

    // Si cambia la cantidad y/o el rango de fechas, hay que re-chequear
    // disponibilidad contra la ventana final (nueva o vieja): un cambio de
    // fechas puede hacer que esta asignación pase a superponerse con otra.
    if (nextQuantity !== row.quantity || datesChanged) {
      const available = await this.stockItemsService.getAvailableQuantity(
        row.stockItemId,
        nextStart,
        nextEnd,
        row.id,
      );
      if (nextQuantity > available) {
        throw new BadRequestException(
          `Cantidad no disponible: quedan ${available} unidad(es) libres para el ${nextStart} a ${nextEnd}.`,
        );
      }
    }

    row.quantity = nextQuantity;
    row.startDate = nextStart;
    row.endDate = nextEnd;

    if (dto.noCost !== undefined) row.noCost = dto.noCost;
    if (dto.manualCost !== undefined) row.manualCost = dto.manualCost;
    if (dto.notes !== undefined) row.notes = dto.notes;

    this.logger.log(`Actualizando ítem de stock de campaña id=${id}`);
    return this.campaignStockItemRepository.save(row);
  }

  async remove(campaignId: number, id: number): Promise<void> {
    await this.campaignsService.assertCampaignEditable(campaignId);
    const row = await this.findOneOrFail(campaignId, id);
    this.logger.log(`Liberando ítem de stock de campaña id=${id} (campaña ${campaignId})`);
    await this.campaignStockItemRepository.softRemove(row);
  }
}
