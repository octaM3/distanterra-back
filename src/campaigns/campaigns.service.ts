import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from '@/config/configuration';
import { Campaign, CampaignKind } from '@/database/entities/campaign.entity';
import { CampaignActivityLog } from '@/database/entities/campaign-activity-log.entity';
import { CampaignExpense } from '@/database/entities/campaign-expense.entity';
import { CampaignGuide } from '@/database/entities/campaign-guide.entity';
import { CampaignPackAnimal } from '@/database/entities/campaign-pack-animal.entity';
import { CampaignStockItem } from '@/database/entities/campaign-stock-item.entity';
import { CampaignVehicle } from '@/database/entities/campaign-vehicle.entity';
import { toFileUrl } from '@/common/utils/file-url.util';
import { ServiceRecordsService } from '@/service-records/service-records.service';
import { CampaignDetail, CampaignExpenseMonthSummary, CampaignListItem } from './campaigns.types';
import {
  computeCampaignStatus,
  computeGuideCost,
  computeStockItemCost,
  computeVehicleCost,
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
    @InjectRepository(CampaignVehicle)
    private readonly campaignVehicleRepository: Repository<CampaignVehicle>,
    @InjectRepository(CampaignGuide)
    private readonly campaignGuideRepository: Repository<CampaignGuide>,
    @InjectRepository(CampaignPackAnimal)
    private readonly campaignPackAnimalRepository: Repository<CampaignPackAnimal>,
    @InjectRepository(CampaignExpense)
    private readonly campaignExpenseRepository: Repository<CampaignExpense>,
    @InjectRepository(CampaignActivityLog)
    private readonly campaignActivityLogRepository: Repository<CampaignActivityLog>,
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly serviceRecordsService: ServiceRecordsService,
  ) {}

  private toListItem(campaign: Campaign): CampaignListItem {
    return {
      id: campaign.id,
      kind: campaign.kind,
      companyId: campaign.companyId,
      companyName: campaign.company?.name ?? '',
      name: campaign.name,
      location: campaign.location,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      finishedAt: campaign.finishedAt,
      status: computeCampaignStatus(campaign.startDate, campaign.endDate, campaign.finishedAt),
      createdAt: campaign.createdAt,
    };
  }

  /** `kind` separa las expediciones ("campana") de los alquileres sueltos ("servicio"); sin filtro vienen todas. */
  async findAll(kind?: CampaignKind): Promise<CampaignListItem[]> {
    this.logger.debug(`Obteniendo campañas${kind ? ` de tipo ${kind}` : ''}`);
    const campaigns = await this.campaignRepository.find({
      where: kind ? { kind } : {},
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

    const [stockItems, vehicles, guides, packAnimals, expenses, activityLogs] = await Promise.all([
      this.campaignStockItemRepository.find({
        where: { campaignId: id },
        relations: ['stockItem', 'stockItem.category'],
        order: { createdAt: 'ASC' },
      }),
      this.campaignVehicleRepository.find({
        where: { campaignId: id },
        relations: ['vehicle'],
        order: { createdAt: 'ASC' },
      }),
      this.campaignGuideRepository.find({
        where: { campaignId: id },
        order: { createdAt: 'ASC' },
      }),
      this.campaignPackAnimalRepository.find({
        where: { campaignId: id },
        order: { createdAt: 'ASC' },
      }),
      this.campaignExpenseRepository.find({
        where: { campaignId: id },
        relations: ['createdByAdmin', 'category'],
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
      const itemDurationDays = daysBetweenInclusive(csi.startDate, csi.endDate);
      const recommendedCost = computeStockItemCost(
        csi.noCost,
        csi.pricePerDay,
        csi.pricePerMonth,
        csi.quantity,
        itemDurationDays,
      );
      // El override manual gana sobre el cálculo automático, salvo "sin
      // costo" (que siempre gana: no tiene sentido cobrar algo marcado gratis).
      const cost = csi.noCost ? 0 : (csi.manualCost ?? recommendedCost);
      return {
        id: csi.id,
        stockItemId: csi.stockItemId,
        stockItemName: csi.stockItem?.name ?? '',
        category: csi.stockItem?.category?.name ?? '',
        quantity: csi.quantity,
        noCost: csi.noCost,
        pricePerDay: csi.pricePerDay,
        pricePerMonth: csi.pricePerMonth,
        manualCost: csi.manualCost,
        recommendedCost,
        startDate: csi.startDate,
        endDate: csi.endDate,
        durationDays: itemDurationDays,
        cost,
        notes: csi.notes,
        createdAt: csi.createdAt,
      };
    });
    const stockItemsTotalCost = stockItemViews.reduce((sum, v) => sum + v.cost, 0);

    const vehicleViews = vehicles.map((cv) => {
      const itemDurationDays = daysBetweenInclusive(cv.startDate, cv.endDate);
      const recommendedCost = computeVehicleCost(
        cv.pricePerDay,
        cv.pricePerMonth,
        itemDurationDays,
      );
      const cost = cv.manualCost ?? recommendedCost;
      return {
        id: cv.id,
        vehicleId: cv.vehicleId,
        licensePlate: cv.vehicle?.licensePlate ?? '',
        vehicleDescription: cv.vehicle?.description ?? null,
        pricePerDay: cv.pricePerDay,
        pricePerMonth: cv.pricePerMonth,
        manualCost: cv.manualCost,
        recommendedCost,
        startDate: cv.startDate,
        endDate: cv.endDate,
        durationDays: itemDurationDays,
        cost,
        notes: cv.notes,
        createdAt: cv.createdAt,
      };
    });
    const vehiclesTotalCost = vehicleViews.reduce((sum, v) => sum + v.cost, 0);

    const guideViews = guides.map((cg) => {
      const itemDurationDays = daysBetweenInclusive(cg.startDate, cg.endDate);
      const recommendedCost = computeGuideCost(
        cg.pricePerDay,
        cg.taxPercentage,
        cg.quantity,
        itemDurationDays,
      );
      const cost = cg.manualCost ?? recommendedCost;
      return {
        id: cg.id,
        quantity: cg.quantity,
        pricePerDay: cg.pricePerDay,
        taxPercentage: cg.taxPercentage,
        manualCost: cg.manualCost,
        recommendedCost,
        cost,
        notes: cg.notes,
        startDate: cg.startDate,
        endDate: cg.endDate,
        durationDays: itemDurationDays,
        createdAt: cg.createdAt,
      };
    });
    const guidesTotalCost = guideViews.reduce((sum, v) => sum + v.cost, 0);

    const packAnimalViews = packAnimals.map((cpa) => {
      const itemDurationDays = daysBetweenInclusive(cpa.startDate, cpa.endDate);
      const recommendedCost = computeGuideCost(
        cpa.pricePerDay,
        cpa.taxPercentage,
        cpa.quantity,
        itemDurationDays,
      );
      const cost = cpa.manualCost ?? recommendedCost;
      return {
        id: cpa.id,
        animalType: cpa.animalType,
        quantity: cpa.quantity,
        pricePerDay: cpa.pricePerDay,
        taxPercentage: cpa.taxPercentage,
        manualCost: cpa.manualCost,
        recommendedCost,
        startDate: cpa.startDate,
        endDate: cpa.endDate,
        durationDays: itemDurationDays,
        cost,
        notes: cpa.notes,
        createdAt: cpa.createdAt,
      };
    });
    const packAnimalsTotalCost = packAnimalViews.reduce((sum, v) => sum + v.cost, 0);

    const expenseViews = expenses.map((e) => ({
      id: e.id,
      description: e.description,
      categoryId: e.categoryId,
      category: e.category?.name ?? null,
      amountUsd: e.amountUsd,
      amountArs: e.amountArs,
      expenseDate: e.expenseDate,
      invoiceUrl: toFileUrl(apiUrl, e.invoiceImagePath),
      invoiceType: e.invoiceType,
      invoiceNumber: e.invoiceNumber,
      businessName: e.businessName,
      createdAt: e.createdAt,
    }));
    const expensesTotal = expenseViews.reduce((sum, v) => sum + (v.amountUsd ?? 0), 0);
    const expensesTotalArs = expenseViews.reduce((sum, v) => sum + (v.amountArs ?? 0), 0);

    // Solo USD entra en el desglose por mes: es la moneda de grandTotal, y no
    // hay tasa de cambio para combinarla con los gastos cargados en ARS.
    const byMonthMap = new Map<string, number>();
    for (const e of expenseViews) {
      const key = monthKeyOf(e.expenseDate);
      byMonthMap.set(key, (byMonthMap.get(key) ?? 0) + (e.amountUsd ?? 0));
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
      durationDays,
      stockItems: stockItemViews,
      stockItemsTotalCost,
      vehicles: vehicleViews,
      vehiclesTotalCost,
      guides: guideViews,
      guidesTotalCost,
      packAnimals: packAnimalViews,
      packAnimalsTotalCost,
      expenses: expenseViews,
      expensesTotal,
      expensesTotalArs,
      expensesByMonth,
      activityLogs: activityLogViews,
      grandTotal:
        stockItemsTotalCost +
        vehiclesTotalCost +
        guidesTotalCost +
        packAnimalsTotalCost +
        expensesTotal,
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
    // Su ítem de gestión nace acá: así ninguna campaña/servicio queda fuera
    // del control de facturación por olvido.
    await this.serviceRecordsService.createForCampaign(saved);
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
    // Se lleva su ítem de gestión, salvo que ya tenga factura o recibo cargados.
    await this.serviceRecordsService.removeForCampaign(id);
    await this.campaignRepository.softRemove(campaign);
    this.logger.log(`Campaña id=${id} eliminada correctamente`);
  }
}
