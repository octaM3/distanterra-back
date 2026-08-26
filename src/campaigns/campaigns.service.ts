import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from '@/config/configuration';
import { Campaign } from '@/database/entities/campaign.entity';
import { CampaignActivityLog } from '@/database/entities/campaign-activity-log.entity';
import { CampaignExpense } from '@/database/entities/campaign-expense.entity';
import { CampaignStockItem } from '@/database/entities/campaign-stock-item.entity';
import { toPublicFileUrl } from '@/common/utils/public-url.util';
import { CampaignDetail, CampaignExpenseMonthSummary, CampaignListItem } from './campaigns.types';
import {
  computeCampaignStatus,
  computeStockItemCost,
  daysBetweenInclusive,
  effectiveEndDate,
  monthKeyOf,
} from './campaigns.util';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ExtendCampaignDto } from './dto/extend-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(CampaignStockItem)
    private readonly campaignStockItemRepository: Repository<CampaignStockItem>,
    @InjectRepository(CampaignExpense)
    private readonly campaignExpenseRepository: Repository<CampaignExpense>,
    @InjectRepository(CampaignActivityLog)
    private readonly campaignActivityLogRepository: Repository<CampaignActivityLog>,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  private toListItem(campaign: Campaign): CampaignListItem {
    return {
      id: campaign.id,
      companyId: campaign.companyId,
      companyName: campaign.company?.name ?? '',
      name: campaign.name,
      location: campaign.location,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      finishedAt: campaign.finishedAt,
      status: computeCampaignStatus(campaign.startDate, campaign.finishedAt),
      createdAt: campaign.createdAt,
    };
  }

  async findAll(): Promise<CampaignListItem[]> {
    this.logger.debug('Obteniendo todas las campañas');
    const campaigns = await this.campaignRepository.find({
      relations: ['company'],
      order: { startDate: 'DESC' },
    });
    return campaigns.map((c) => this.toListItem(c));
  }

  async findCampaignEntityOrFail(id: number): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!campaign) {
      this.logger.warn(`Campaña con id=${id} no encontrada`);
      throw new NotFoundException(`Campaña ${id} no encontrada`);
    }
    return campaign;
  }

  /** Usado por los sub-recursos (stock/gastos/actividades) antes de mutar. */
  async assertCampaignEditable(id: number): Promise<Campaign> {
    const campaign = await this.findCampaignEntityOrFail(id);
    if (campaign.finishedAt) {
      throw new BadRequestException(
        'La campaña ya fue finalizada: no se pueden agregar ni modificar ítems, gastos ni actividades.',
      );
    }
    return campaign;
  }

  async getDetail(id: number): Promise<CampaignDetail> {
    const campaign = await this.findCampaignEntityOrFail(id);
    const apiUrl = this.configService.get('apiUrl', { infer: true });

    const [stockItems, expenses, activityLogs] = await Promise.all([
      this.campaignStockItemRepository.find({
        where: { campaignId: id },
        relations: ['stockItem', 'stockItem.category'],
        order: { createdAt: 'ASC' },
      }),
      this.campaignExpenseRepository.find({
        where: { campaignId: id },
        relations: ['createdByAdmin'],
        order: { expenseDate: 'ASC' },
      }),
      this.campaignActivityLogRepository.find({
        where: { campaignId: id },
        relations: ['createdByAdmin'],
        order: { logDate: 'ASC' },
      }),
    ]);

    const durationDays = daysBetweenInclusive(campaign.startDate, effectiveEndDate(campaign));

    const stockItemViews = stockItems.map((csi) => {
      const cost = computeStockItemCost(csi.pricingType, csi.unitPrice, csi.quantity, durationDays);
      return {
        id: csi.id,
        stockItemId: csi.stockItemId,
        stockItemName: csi.stockItem?.name ?? '',
        category: csi.stockItem?.category?.name ?? '',
        quantity: csi.quantity,
        pricingType: csi.pricingType,
        unitPrice: csi.unitPrice,
        cost,
        notes: csi.notes,
        createdAt: csi.createdAt,
      };
    });
    const stockItemsTotalCost = stockItemViews.reduce((sum, v) => sum + v.cost, 0);

    const expenseViews = expenses.map((e) => ({
      id: e.id,
      description: e.description,
      category: e.category,
      amount: e.amount,
      expenseDate: e.expenseDate,
      invoiceUrl: toPublicFileUrl(apiUrl, e.invoiceImagePath),
      createdAt: e.createdAt,
    }));
    const expensesTotal = expenseViews.reduce((sum, v) => sum + v.amount, 0);

    const byMonthMap = new Map<string, number>();
    for (const e of expenseViews) {
      const key = monthKeyOf(e.expenseDate);
      byMonthMap.set(key, (byMonthMap.get(key) ?? 0) + e.amount);
    }
    const expensesByMonth: CampaignExpenseMonthSummary[] = Array.from(byMonthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total }));

    const activityLogViews = activityLogs.map((log) => ({
      id: log.id,
      logDate: log.logDate,
      description: log.description,
      createdByUsername: log.createdByAdmin?.username ?? null,
      createdAt: log.createdAt,
    }));

    return {
      ...this.toListItem(campaign),
      description: campaign.description,
      stockItems: stockItemViews,
      stockItemsTotalCost,
      expenses: expenseViews,
      expensesTotal,
      expensesByMonth,
      activityLogs: activityLogViews,
      grandTotal: stockItemsTotalCost + expensesTotal,
    };
  }

  async create(dto: CreateCampaignDto, createdBy: number): Promise<CampaignListItem> {
    this.logger.log(`Creando campaña: "${dto.name}"`);
    if (new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException('La fecha de fin no puede ser anterior a la fecha de inicio');
    }
    const campaign = this.campaignRepository.create({ ...dto, createdBy });
    const saved = await this.campaignRepository.save(campaign);
    this.logger.log(`Campaña creada con id=${saved.id}`);
    return this.toListItem(await this.findCampaignEntityOrFail(saved.id));
  }

  async update(id: number, dto: UpdateCampaignDto): Promise<CampaignListItem> {
    this.logger.log(`Actualizando campaña id=${id}`);
    const campaign = await this.findCampaignEntityOrFail(id);
    const nextStart = dto.startDate ?? campaign.startDate;
    const nextEnd = dto.endDate ?? campaign.endDate;
    if (new Date(nextEnd) < new Date(nextStart)) {
      throw new BadRequestException('La fecha de fin no puede ser anterior a la fecha de inicio');
    }
    Object.assign(campaign, dto);
    const saved = await this.campaignRepository.save(campaign);
    this.logger.log(`Campaña id=${id} actualizada correctamente`);
    return this.toListItem(await this.findCampaignEntityOrFail(saved.id));
  }

  async extend(id: number, dto: ExtendCampaignDto): Promise<CampaignListItem> {
    const campaign = await this.assertCampaignEditable(id);
    if (new Date(dto.newEndDate) <= new Date(campaign.endDate)) {
      throw new BadRequestException(
        'La nueva fecha de fin debe ser posterior a la fecha de fin actual',
      );
    }
    this.logger.log(`Ampliando campaña id=${id}: ${campaign.endDate} -> ${dto.newEndDate}`);
    const previousEndDate = campaign.endDate;
    campaign.endDate = dto.newEndDate;
    await this.campaignRepository.save(campaign);

    const log = this.campaignActivityLogRepository.create({
      campaignId: id,
      logDate: dto.newEndDate,
      description: `Campaña ampliada: la fecha de fin pasó de ${previousEndDate} a ${dto.newEndDate}.`,
    });
    await this.campaignActivityLogRepository.save(log);

    return this.toListItem(await this.findCampaignEntityOrFail(id));
  }

  async finish(id: number): Promise<CampaignListItem> {
    const campaign = await this.findCampaignEntityOrFail(id);
    if (campaign.finishedAt) {
      throw new BadRequestException('La campaña ya está finalizada');
    }
    this.logger.log(`Finalizando campaña id=${id}`);
    campaign.finishedAt = new Date();
    await this.campaignRepository.save(campaign);
    this.logger.log(`Campaña id=${id} finalizada: stock liberado`);
    return this.toListItem(await this.findCampaignEntityOrFail(id));
  }

  async softRemove(id: number): Promise<void> {
    this.logger.log(`Eliminando (soft) campaña id=${id}`);
    const campaign = await this.findCampaignEntityOrFail(id);
    await this.campaignRepository.softRemove(campaign);
    this.logger.log(`Campaña id=${id} eliminada correctamente`);
  }
}
