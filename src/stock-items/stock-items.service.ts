import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignStockItem } from '@/database/entities/campaign-stock-item.entity';
import { StockCategory } from '@/database/entities/stock-category.entity';
import { StockItem } from '@/database/entities/stock-item.entity';
import { todayLocalDateString } from '@/common/utils/date.util';
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { UpdateStockItemDto } from './dto/update-stock-item.dto';

export interface StockItemView {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  totalQuantity: number;
  pricePerDay: number | null;
  pricePerMonth: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lockedQuantity: number;
  availableQuantity: number;
}

/** Una asignación vigente de este ítem en otra (o la misma) campaña — usado para pintar el calendario del modal de asignación. */
export interface StockItemOccupiedRange {
  startDate: string;
  endDate: string;
  quantity: number;
  campaignId: number;
  campaignName: string;
}

@Injectable()
export class StockItemsService {
  private readonly logger = new Logger(StockItemsService.name);

  constructor(
    @InjectRepository(StockItem)
    private readonly stockItemRepository: Repository<StockItem>,
    @InjectRepository(StockCategory)
    private readonly stockCategoryRepository: Repository<StockCategory>,
  ) {}

  /**
   * Cantidad bloqueada por ítem: suma de campaign_stock_items.quantity para
   * asignaciones vigentes (no eliminadas) en campañas no finalizadas (ni
   * borradas), sin importar sus fechas. Usado solo como resguardo
   * conservador al bajar `totalQuantity` o eliminar el ítem (no se puede
   * tocar mientras siga comprometido en alguna campaña activa, aunque su
   * ventana ya haya pasado) — para lockedQuantity/availableQuantity del
   * catálogo ver getLockedQuantitiesToday, y para una ventana de fechas
   * puntual (al asignar a una campaña) ver getAvailableQuantity / getSchedule.
   */
  private async getLockedQuantities(): Promise<Map<number, number>> {
    const rows = await this.stockItemRepository.manager
      .createQueryBuilder()
      .select('csi.stock_item_id', 'stockItemId')
      .addSelect('SUM(csi.quantity)', 'locked')
      .from('campaign_stock_items', 'csi')
      .innerJoin('campaigns', 'c', 'c.id = csi.campaign_id')
      .where('csi.deleted_at IS NULL')
      .andWhere('c.deleted_at IS NULL')
      .andWhere('c.finished_at IS NULL')
      .groupBy('csi.stock_item_id')
      .getRawMany<{ stockItemId: number; locked: string }>();

    const map = new Map<number, number>();
    for (const row of rows) {
      map.set(row.stockItemId, parseInt(row.locked, 10));
    }
    return map;
  }

  /**
   * Cantidad realmente en uso HOY por ítem: igual que getLockedQuantities
   * pero sólo cuenta asignaciones cuyo start_date/end_date cubren la fecha
   * de hoy. A diferencia de esa, una asignación cuya ventana ya terminó deja
   * de contar aunque la campaña no se haya marcado como finalizada a mano.
   * Usado para lockedQuantity/availableQuantity del catálogo general.
   */
  private async getLockedQuantitiesToday(): Promise<Map<number, number>> {
    const today = todayLocalDateString();
    const rows = await this.stockItemRepository.manager
      .createQueryBuilder()
      .select('csi.stock_item_id', 'stockItemId')
      .addSelect('SUM(csi.quantity)', 'locked')
      .from('campaign_stock_items', 'csi')
      .innerJoin('campaigns', 'c', 'c.id = csi.campaign_id')
      .where('csi.deleted_at IS NULL')
      .andWhere('c.deleted_at IS NULL')
      .andWhere('c.finished_at IS NULL')
      .andWhere('csi.start_date <= :today', { today })
      .andWhere('csi.end_date >= :today', { today })
      .groupBy('csi.stock_item_id')
      .getRawMany<{ stockItemId: number; locked: string }>();

    const map = new Map<number, number>();
    for (const row of rows) {
      map.set(row.stockItemId, parseInt(row.locked, 10));
    }
    return map;
  }

  private toView(item: StockItem, lockedQuantity: number): StockItemView {
    return {
      id: item.id,
      name: item.name,
      categoryId: item.categoryId,
      categoryName: item.category?.name ?? '',
      totalQuantity: item.totalQuantity,
      pricePerDay: item.pricePerDay,
      pricePerMonth: item.pricePerMonth,
      notes: item.notes,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lockedQuantity,
      availableQuantity: item.totalQuantity - lockedQuantity,
    };
  }

  async findAll(): Promise<StockItemView[]> {
    this.logger.debug('Obteniendo todos los ítems de stock');
    const items = await this.stockItemRepository.find({ relations: ['category'] });
    const locked = await this.getLockedQuantitiesToday();
    return items
      .map((item) => this.toView(item, locked.get(item.id) ?? 0))
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName) || a.name.localeCompare(b.name));
  }

  async findOneOrFail(id: number): Promise<StockItem> {
    const item = await this.stockItemRepository.findOne({ where: { id } });
    if (!item) {
      this.logger.warn(`Ítem de stock con id=${id} no encontrado`);
      throw new NotFoundException(`Ítem de stock ${id} no encontrado`);
    }
    return item;
  }

  private async assertCategoryExists(categoryId: number): Promise<void> {
    const exists = await this.stockCategoryRepository.exists({ where: { id: categoryId } });
    if (!exists) {
      throw new NotFoundException(`Categoría de stock ${categoryId} no encontrada`);
    }
  }

  async findOneViewOrFail(id: number): Promise<StockItemView> {
    const item = await this.stockItemRepository.findOne({ where: { id }, relations: ['category'] });
    if (!item) {
      throw new NotFoundException(`Ítem de stock ${id} no encontrado`);
    }
    const locked = (await this.getLockedQuantitiesToday()).get(id) ?? 0;
    return this.toView(item, locked);
  }

  /**
   * Cantidad disponible para una ventana de fechas puntual (usada al validar
   * asignaciones a campañas): solo cuenta como "en uso" las asignaciones
   * cuya propia startDate/endDate se superponen con `startDate`/`endDate`,
   * no todas las asignaciones de la campaña en curso. Así el mismo ítem
   * puede asignarse a otra campaña en los días en que no está en uso.
   */
  async getAvailableQuantity(
    stockItemId: number,
    startDate: string,
    endDate: string,
    excludeCampaignStockItemId?: number,
  ): Promise<number> {
    const item = await this.findOneOrFail(stockItemId);
    const qb = this.stockItemRepository.manager
      .createQueryBuilder()
      .select('COALESCE(SUM(csi.quantity), 0)', 'locked')
      .from('campaign_stock_items', 'csi')
      .innerJoin('campaigns', 'c', 'c.id = csi.campaign_id')
      .where('csi.stock_item_id = :stockItemId', { stockItemId })
      .andWhere('csi.deleted_at IS NULL')
      .andWhere('c.deleted_at IS NULL')
      .andWhere('c.finished_at IS NULL')
      .andWhere('csi.start_date <= :endDate', { endDate })
      .andWhere('csi.end_date >= :startDate', { startDate });

    if (excludeCampaignStockItemId) {
      qb.andWhere('csi.id != :excludeId', { excludeId: excludeCampaignStockItemId });
    }

    const result = await qb.getRawOne<{ locked: string }>();
    const locked = parseInt(result?.locked ?? '0', 10);
    return item.totalQuantity - locked;
  }

  /**
   * Lista de asignaciones vigentes de este ítem en campañas no finalizadas
   * (ni borradas), cada una con su propia ventana de fechas y cantidad —
   * usado por el modal de asignación de una campaña para pintar en el
   * calendario qué días están ocupados (y por cuánta cantidad) en vez de
   * bloquear el ítem entero. `excludeCampaignStockItemId` permite ignorar
   * la propia asignación al editarla.
   */
  async getSchedule(
    stockItemId: number,
    excludeCampaignStockItemId?: number,
  ): Promise<StockItemOccupiedRange[]> {
    await this.findOneOrFail(stockItemId);
    const qb = this.stockItemRepository.manager
      .createQueryBuilder(CampaignStockItem, 'csi')
      .innerJoinAndSelect('csi.campaign', 'campaign')
      .where('csi.stockItemId = :stockItemId', { stockItemId })
      .andWhere('csi.deletedAt IS NULL')
      .andWhere('campaign.deletedAt IS NULL')
      .andWhere('campaign.finishedAt IS NULL')
      .orderBy('csi.startDate', 'ASC');

    if (excludeCampaignStockItemId) {
      qb.andWhere('csi.id != :excludeId', { excludeId: excludeCampaignStockItemId });
    }

    const rows = await qb.getMany();
    return rows.map((row) => ({
      startDate: row.startDate,
      endDate: row.endDate,
      quantity: row.quantity,
      campaignId: row.campaignId,
      campaignName: row.campaign.name,
    }));
  }

  async create(dto: CreateStockItemDto): Promise<StockItemView> {
    this.logger.log(`Creando ítem de stock: "${dto.name}"`);
    await this.assertCategoryExists(dto.categoryId);
    const item = this.stockItemRepository.create({
      name: dto.name,
      categoryId: dto.categoryId,
      totalQuantity: dto.totalQuantity,
      pricePerDay: dto.pricePerDay ?? null,
      pricePerMonth: dto.pricePerMonth ?? null,
      notes: dto.notes,
      isActive: dto.isActive,
    });
    const saved = await this.stockItemRepository.save(item);
    this.logger.log(`Ítem de stock creado con id=${saved.id}`);
    return this.findOneViewOrFail(saved.id);
  }

  async update(id: number, dto: UpdateStockItemDto): Promise<StockItemView> {
    this.logger.log(`Actualizando ítem de stock id=${id}`);
    const item = await this.findOneOrFail(id);

    if (dto.categoryId !== undefined) {
      await this.assertCategoryExists(dto.categoryId);
    }

    if (dto.totalQuantity !== undefined) {
      const locked = (await this.getLockedQuantities()).get(id) ?? 0;
      if (dto.totalQuantity < locked) {
        throw new BadRequestException(
          `No se puede bajar el total a ${dto.totalQuantity}: hay ${locked} unidad(es) actualmente en uso en campañas activas.`,
        );
      }
    }

    Object.assign(item, dto);
    await this.stockItemRepository.save(item);
    this.logger.log(`Ítem de stock id=${id} actualizado correctamente`);
    return this.findOneViewOrFail(id);
  }

  async softRemove(id: number): Promise<void> {
    this.logger.log(`Eliminando (soft) ítem de stock id=${id}`);
    const item = await this.findOneOrFail(id);
    const locked = (await this.getLockedQuantities()).get(id) ?? 0;
    if (locked > 0) {
      throw new BadRequestException(
        'No se puede eliminar el ítem: está asignado a una o más campañas activas.',
      );
    }
    await this.stockItemRepository.softRemove(item);
    this.logger.log(`Ítem de stock id=${id} eliminado correctamente`);
  }
}
