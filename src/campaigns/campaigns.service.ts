import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from '@/config/configuration';
import {
  Campaign,
  CampaignApprovalStatus,
  CampaignKind,
} from '@/database/entities/campaign.entity';
import { CampaignActivityLog } from '@/database/entities/campaign-activity-log.entity';
import { CampaignExpense } from '@/database/entities/campaign-expense.entity';
import { CampaignGuide } from '@/database/entities/campaign-guide.entity';
import { CampaignPackAnimal } from '@/database/entities/campaign-pack-animal.entity';
import { CampaignStockItem } from '@/database/entities/campaign-stock-item.entity';
import { CampaignVehicle } from '@/database/entities/campaign-vehicle.entity';
import { toFileUrl } from '@/common/utils/file-url.util';
import { ServiceRecordsService } from '@/service-records/service-records.service';
import { StockItemsService } from '@/stock-items/stock-items.service';
import { VehiclesService } from '@/vehicles/vehicles.service';
import { CampaignDetail, CampaignExpenseMonthSummary, CampaignListItem } from './campaigns.types';
import {
  assertApprovalTransition,
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
    private readonly stockItemsService: StockItemsService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  private toListItem(campaign: Campaign): CampaignListItem {
    return {
      id: campaign.id,
      kind: campaign.kind,
      approvalStatus: campaign.approvalStatus,
      approvedAt: campaign.approvedAt,
      rejectedAt: campaign.rejectedAt,
      taxPercentage: campaign.taxPercentage,
      companyId: campaign.companyId,
      companyName: campaign.company?.name ?? '',
      name: campaign.name,
      location: campaign.location,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      finishedAt: campaign.finishedAt,
      status: computeCampaignStatus(
        campaign.startDate,
        campaign.endDate,
        campaign.finishedAt,
        campaign.approvalStatus,
      ),
      createdAt: campaign.createdAt,
    };
  }

  /**
   * `kind` separa las expediciones ("campana") de los alquileres sueltos
   * ("servicio"); `approvalStatus` separa el trabajo en firme de los
   * presupuestos. Los dos filtros son independientes: se presupuestan tanto
   * campañas como servicios.
   *
   * Sin filtro de aprobación vienen solo las aprobadas, no todas: las
   * pantallas de campañas y servicios existían antes que los presupuestos y
   * listan trabajo real, así que un presupuesto no tiene que aparecer ahí
   * salvo que se lo pida explícitamente.
   */
  async findAll(
    kind?: CampaignKind,
    approvalStatus?: CampaignApprovalStatus,
  ): Promise<CampaignListItem[]> {
    this.logger.debug(
      `Obteniendo campañas${kind ? ` de tipo ${kind}` : ''} (${approvalStatus ?? 'aprobada'})`,
    );
    const campaigns = await this.campaignRepository.find({
      where: {
        ...(kind ? { kind } : {}),
        approvalStatus: approvalStatus ?? 'aprobada',
      },
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

  /**
   * Toda campaña y todo servicio nacen como presupuesto: es la única puerta
   * de entrada, para que nada llegue a estar en firme sin haber pasado por el
   * documento que se le mandó a la empresa. Pasar a "aprobada" es `approve`,
   * que además reserva el equipamiento y crea el ítem de gestión.
   */
  async create(dto: CreateCampaignDto, createdBy: number): Promise<CampaignListItem> {
    this.logger.log(`Creando presupuesto de ${dto.kind ?? 'campana'}: "${dto.name}"`);
    if (new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException('La fecha de fin no puede ser anterior a la fecha de inicio');
    }
    const campaign = this.campaignRepository.create({
      ...dto,
      createdBy,
      approvalStatus: 'presupuesto',
      approvedAt: null,
    });
    const saved = await this.campaignRepository.save(campaign);
    this.logger.log(`Presupuesto creado con id=${saved.id}`);
    // Sin ítem de gestión todavía: un presupuesto no tiene nada que facturar.
    // El suyo nace al aprobarlo.
    return this.toListItem(await this.findCampaignEntityOrFail(saved.id));
  }

  /**
   * Conflictos de disponibilidad de un presupuesto: qué cosas de las que
   * pidió ya no están libres en sus fechas.
   *
   * Hace falta porque un presupuesto no reserva nada mientras espera
   * (RESERVING_APPROVAL_STATUS). Entre que se arma y el cliente contesta,
   * otra campaña puede haberse llevado el equipamiento, y sin este chequeo
   * el presupuesto se aprobaría igual y el problema aparecería recién el día
   * de salir. La disponibilidad se mira excluyendo la propia asignación, que
   * todavía no cuenta pero contaría si esto fuera una campaña.
   */
  async getApprovalConflicts(id: number): Promise<string[]> {
    const [stockItems, vehicles] = await Promise.all([
      this.campaignStockItemRepository.find({
        where: { campaignId: id },
        relations: ['stockItem'],
      }),
      this.campaignVehicleRepository.find({
        where: { campaignId: id },
        relations: ['vehicle'],
      }),
    ]);

    const conflicts: string[] = [];

    for (const assignment of stockItems) {
      const available = await this.stockItemsService.getAvailableQuantity(
        assignment.stockItemId,
        assignment.startDate,
        assignment.endDate,
        assignment.id,
      );
      if (assignment.quantity > available) {
        conflicts.push(
          `${assignment.stockItem.name}: se presupuestaron ${assignment.quantity} y quedan ${available} libres del ${assignment.startDate} al ${assignment.endDate}.`,
        );
      }
    }

    for (const assignment of vehicles) {
      const free = await this.vehiclesService.isAvailable(
        assignment.vehicleId,
        assignment.startDate,
        assignment.endDate,
        assignment.id,
      );
      if (!free) {
        conflicts.push(
          `${assignment.vehicle.licensePlate}: ya está tomado del ${assignment.startDate} al ${assignment.endDate}.`,
        );
      }
    }

    return conflicts;
  }

  /**
   * Aprobar es el paso que convierte el presupuesto en trabajo real: recién
   * acá el stock y los vehículos quedan reservados y nace el ítem de gestión
   * para facturarlo. No se copia nada: la campaña ya estaba armada.
   *
   * `force` deja aprobar aunque algo ya no esté disponible. Existe porque el
   * conflicto puede ser real y resolverse por fuera del sistema (se alquila
   * una carpa más, se reacomoda otra campaña), y en ese caso la alternativa
   * sería no poder registrar un trabajo que igual se va a hacer.
   */
  async approve(id: number, force = false): Promise<CampaignListItem> {
    const campaign = await this.findCampaignEntityOrFail(id);
    // Un rechazado no se aprueba de una: primero se reabre. Si no, el estado
    // saltaría de "rechazada" a "aprobada" sin que nadie haya vuelto a mirar
    // lo que se le había cargado ni las fechas, que a esa altura pueden estar
    // vencidas.
    assertApprovalTransition(campaign.approvalStatus, 'aprobada');

    if (!force) {
      const conflicts = await this.getApprovalConflicts(id);
      if (conflicts.length > 0) {
        throw new BadRequestException(
          `No se puede aprobar: hay ${conflicts.length} recurso(s) que ya no están disponibles. ${conflicts.join(' ')}`,
        );
      }
    }

    this.logger.log(`Aprobando presupuesto id=${id}${force ? ' (forzado)' : ''}`);
    campaign.approvalStatus = 'aprobada';
    campaign.approvedAt = new Date();
    campaign.rejectedAt = null;
    await this.campaignRepository.save(campaign);
    await this.serviceRecordsService.createForCampaign(campaign);
    this.logger.log(`Presupuesto id=${id} aprobado: stock y vehículos reservados`);

    return this.toListItem(await this.findCampaignEntityOrFail(id));
  }

  /** El cliente no lo tomó: queda archivado, sin reservar nada y fuera de los listados. */
  async reject(id: number): Promise<CampaignListItem> {
    const campaign = await this.findCampaignEntityOrFail(id);
    assertApprovalTransition(campaign.approvalStatus, 'rechazada');
    this.logger.log(`Rechazando presupuesto id=${id}`);
    campaign.approvalStatus = 'rechazada';
    campaign.rejectedAt = new Date();
    await this.campaignRepository.save(campaign);
    return this.toListItem(await this.findCampaignEntityOrFail(id));
  }

  /** Vuelve un presupuesto rechazado a la lista de pendientes (el cliente reabrió la conversación). */
  async reopen(id: number): Promise<CampaignListItem> {
    const campaign = await this.findCampaignEntityOrFail(id);
    assertApprovalTransition(campaign.approvalStatus, 'presupuesto');
    this.logger.log(`Reabriendo presupuesto id=${id}`);
    campaign.approvalStatus = 'presupuesto';
    campaign.rejectedAt = null;
    await this.campaignRepository.save(campaign);
    return this.toListItem(await this.findCampaignEntityOrFail(id));
  }

  async update(id: number, dto: UpdateCampaignDto): Promise<CampaignListItem> {
    this.logger.log(`Actualizando campaña id=${id}`);
    // Una campaña finalizada es historia: sus costos quedaron congelados (ver
    // effectiveEndDate) y cambiarle las fechas ahora los movería. Las
    // pantallas ya esconden el botón de editar; esto lo cierra por API.
    const campaign = await this.assertCampaignEditable(id);
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

  /**
   * Ampliar y finalizar son acciones sobre trabajo en marcha, y un
   * presupuesto todavía no lo es: sus fechas son una propuesta que se cambia
   * editándolo, y no hay nada que cerrar ni stock que liberar porque nunca se
   * reservó. Las pantallas ya esconden los botones; esto es para que tampoco
   * se pueda por API.
   */
  private assertApproved(campaign: Campaign, action: string): void {
    if (campaign.approvalStatus !== 'aprobada') {
      throw new BadRequestException(
        `Esto todavía es un presupuesto: no se puede ${action}. Aprobalo primero.`,
      );
    }
  }

  async extend(id: number, dto: ExtendCampaignDto): Promise<CampaignListItem> {
    const campaign = await this.assertCampaignEditable(id);
    this.assertApproved(campaign, 'ampliar la fecha de fin');
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
    this.assertApproved(campaign, 'finalizarlo');
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
