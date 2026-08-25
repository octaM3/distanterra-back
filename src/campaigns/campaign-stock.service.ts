import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignStockItem } from '@/database/entities/campaign-stock-item.entity';
import { StockItem, StockPricingType } from '@/database/entities/stock-item.entity';
import { StockItemsService } from '@/stock-items/stock-items.service';
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

  /**
   * Valida que la modalidad de cobro elegida tenga un precio cargado en el
   * catálogo (salvo "none", siempre permitida) y devuelve el precio unitario
   * a snapshotear para esa modalidad.
   */
  private resolveUnitPrice(stockItem: StockItem, pricingType: StockPricingType): number {
    if (pricingType === 'per_day') {
      if (stockItem.pricePerDay == null) {
        throw new BadRequestException(`"${stockItem.name}" no tiene precio por día configurado.`);
      }
      return stockItem.pricePerDay;
    }
    if (pricingType === 'per_month') {
      if (stockItem.pricePerMonth == null) {
        throw new BadRequestException(`"${stockItem.name}" no tiene precio por mes configurado.`);
      }
      return stockItem.pricePerMonth;
    }
    return 0;
  }

  async assign(campaignId: number, dto: AssignStockItemDto): Promise<CampaignStockItem> {
    await this.campaignsService.assertCampaignEditable(campaignId);
    const stockItem = await this.stockItemsService.findOneOrFail(dto.stockItemId);

    const available = await this.stockItemsService.getAvailableQuantity(dto.stockItemId);
    if (dto.quantity > available) {
      throw new BadRequestException(
        `Cantidad no disponible: quedan ${available} unidad(es) de "${stockItem.name}" libres (de ${stockItem.totalQuantity} en total).`,
      );
    }

    const unitPrice = this.resolveUnitPrice(stockItem, dto.pricingType);

    this.logger.log(
      `Asignando ${dto.quantity} unidad(es) de "${stockItem.name}" a la campaña ${campaignId}`,
    );
    const row = this.campaignStockItemRepository.create({
      campaignId,
      stockItemId: dto.stockItemId,
      quantity: dto.quantity,
      pricingType: dto.pricingType,
      unitPrice,
      notes: dto.notes ?? null,
    });
    return this.campaignStockItemRepository.save(row);
  }

  async update(
    campaignId: number,
    id: number,
    dto: UpdateCampaignStockItemDto,
  ): Promise<CampaignStockItem> {
    await this.campaignsService.assertCampaignEditable(campaignId);
    const row = await this.findOneOrFail(campaignId, id);

    if (dto.quantity !== undefined && dto.quantity !== row.quantity) {
      const available = await this.stockItemsService.getAvailableQuantity(row.stockItemId, row.id);
      if (dto.quantity > available) {
        throw new BadRequestException(
          `Cantidad no disponible: quedan ${available} unidad(es) libres para asignar.`,
        );
      }
      row.quantity = dto.quantity;
    }

    if (dto.pricingType !== undefined && dto.pricingType !== row.pricingType) {
      const stockItem = await this.stockItemsService.findOneOrFail(row.stockItemId);
      row.unitPrice = this.resolveUnitPrice(stockItem, dto.pricingType);
      row.pricingType = dto.pricingType;
    }

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
