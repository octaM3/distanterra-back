import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignVehicle } from '@/database/entities/campaign-vehicle.entity';
import { Vehicle } from '@/database/entities/vehicle.entity';
import { todayLocalDateString } from '@/common/utils/date.util';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

export interface VehicleView {
  id: number;
  licensePlate: string;
  description: string | null;
  pricePerDay: number | null;
  pricePerMonth: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Si está en uso HOY (hay una asignación vigente cuyo start_date/end_date
  // cubren la fecha de hoy) — no simplemente "asignado a alguna campaña no
  // finalizada", así una campaña futura que todavía no arrancó no lo marca
  // como ocupado (ver getUsageByVehicle).
  isAvailable: boolean;
  lockedInCampaignId: number | null;
  lockedInCampaignName: string | null;
  // Próxima vez que el vehículo va a estar en uso (la asignación vigente
  // más próxima cuyo start_date todavía no llegó), si no está en uso hoy.
  nextUseDate: string | null;
  nextUseCampaignId: number | null;
  nextUseCampaignName: string | null;
}

/** Una asignación vigente de este vehículo en otra (o la misma) campaña — usado para pintar el calendario del modal de asignación. */
export interface VehicleOccupiedRange {
  startDate: string;
  endDate: string;
  campaignId: number;
  campaignName: string;
}

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  /**
   * Vehículo -> campaña que lo tiene bloqueado (asignación vigente, no
   * eliminada, en una campaña no finalizada ni borrada), sin importar sus
   * fechas. Usado para el catálogo general y el resguardo al eliminar el
   * vehículo — para saber qué queda libre en una ventana de fechas puntual
   * (al asignar a una campaña) ver isAvailable / getSchedule en su lugar.
   */
  private async getLockedByCampaign(): Promise<Map<number, { id: number; name: string }>> {
    const rows = await this.vehicleRepository.manager
      .createQueryBuilder()
      .select('cv.vehicle_id', 'vehicleId')
      .addSelect('c.id', 'campaignId')
      .addSelect('c.name', 'campaignName')
      .from('campaign_vehicles', 'cv')
      .innerJoin('campaigns', 'c', 'c.id = cv.campaign_id')
      .where('cv.deleted_at IS NULL')
      .andWhere('c.deleted_at IS NULL')
      .andWhere('c.finished_at IS NULL')
      .getRawMany<{ vehicleId: number; campaignId: number; campaignName: string }>();

    const map = new Map<number, { id: number; name: string }>();
    for (const row of rows) {
      map.set(row.vehicleId, { id: row.campaignId, name: row.campaignName });
    }
    return map;
  }

  /**
   * Uso real de cada vehículo, a partir de todas sus asignaciones vigentes
   * (no eliminadas, en campañas no finalizadas ni borradas): `current` es la
   * asignación que cubre hoy (si hay una), `next` es la próxima asignación
   * futura más cercana (si no está en uso hoy). A diferencia de
   * getLockedByCampaign, sí mira las fechas — para el catálogo, "en uso"
   * significa en uso *ahora*, no "tiene una campaña asignada en algún
   * momento futuro".
   */
  private async getUsageByVehicle(): Promise<
    Map<
      number,
      {
        current?: { id: number; name: string };
        next?: { startDate: string; id: number; name: string };
      }
    >
  > {
    const today = todayLocalDateString();
    const rows = await this.vehicleRepository.manager
      .createQueryBuilder(CampaignVehicle, 'cv')
      .innerJoinAndSelect('cv.campaign', 'campaign')
      .where('cv.deletedAt IS NULL')
      .andWhere('campaign.deletedAt IS NULL')
      .andWhere('campaign.finishedAt IS NULL')
      .orderBy('cv.startDate', 'ASC')
      .getMany();

    const map = new Map<
      number,
      {
        current?: { id: number; name: string };
        next?: { startDate: string; id: number; name: string };
      }
    >();
    for (const row of rows) {
      const entry = map.get(row.vehicleId) ?? {};
      if (row.startDate <= today && row.endDate >= today) {
        entry.current = { id: row.campaignId, name: row.campaign.name };
      } else if (row.startDate > today && !entry.next) {
        // Las filas vienen ordenadas por startDate ASC, así que la primera
        // futura que se encuentra por vehículo ya es la más próxima.
        entry.next = { startDate: row.startDate, id: row.campaignId, name: row.campaign.name };
      }
      map.set(row.vehicleId, entry);
    }
    return map;
  }

  private toView(
    vehicle: Vehicle,
    usage:
      | {
          current?: { id: number; name: string };
          next?: { startDate: string; id: number; name: string };
        }
      | undefined,
  ): VehicleView {
    return {
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      description: vehicle.description,
      pricePerDay: vehicle.pricePerDay,
      pricePerMonth: vehicle.pricePerMonth,
      notes: vehicle.notes,
      isActive: vehicle.isActive,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
      isAvailable: !usage?.current,
      lockedInCampaignId: usage?.current?.id ?? null,
      lockedInCampaignName: usage?.current?.name ?? null,
      nextUseDate: usage?.next?.startDate ?? null,
      nextUseCampaignId: usage?.next?.id ?? null,
      nextUseCampaignName: usage?.next?.name ?? null,
    };
  }

  async findAll(): Promise<VehicleView[]> {
    this.logger.debug('Obteniendo todos los vehículos');
    const vehicles = await this.vehicleRepository.find();
    const usageByVehicle = await this.getUsageByVehicle();
    return vehicles
      .map((v) => this.toView(v, usageByVehicle.get(v.id)))
      .sort((a, b) => a.licensePlate.localeCompare(b.licensePlate));
  }

  async findOneOrFail(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });
    if (!vehicle) {
      this.logger.warn(`Vehículo con id=${id} no encontrado`);
      throw new NotFoundException(`Vehículo ${id} no encontrado`);
    }
    return vehicle;
  }

  async findOneViewOrFail(id: number): Promise<VehicleView> {
    const vehicle = await this.findOneOrFail(id);
    const usage = (await this.getUsageByVehicle()).get(id);
    return this.toView(vehicle, usage);
  }

  /**
   * Si el vehículo está disponible para una ventana de fechas puntual (usada
   * al validar asignaciones a campañas): solo se considera "en uso" si
   * alguna asignación vigente tiene su propia startDate/endDate superpuesta
   * con `startDate`/`endDate`, no cualquier asignación de la campaña en
   * curso. Así el mismo vehículo puede asignarse a otra campaña en los días
   * en que no está en uso.
   */
  async isAvailable(
    vehicleId: number,
    startDate: string,
    endDate: string,
    excludeCampaignVehicleId?: number,
  ): Promise<boolean> {
    await this.findOneOrFail(vehicleId);
    const qb = this.vehicleRepository.manager
      .createQueryBuilder()
      .select('cv.id', 'id')
      .from('campaign_vehicles', 'cv')
      .innerJoin('campaigns', 'c', 'c.id = cv.campaign_id')
      .where('cv.vehicle_id = :vehicleId', { vehicleId })
      .andWhere('cv.deleted_at IS NULL')
      .andWhere('c.deleted_at IS NULL')
      .andWhere('c.finished_at IS NULL')
      .andWhere('cv.start_date <= :endDate', { endDate })
      .andWhere('cv.end_date >= :startDate', { startDate });

    if (excludeCampaignVehicleId) {
      qb.andWhere('cv.id != :excludeId', { excludeId: excludeCampaignVehicleId });
    }

    const locked = await qb.getRawOne();
    return !locked;
  }

  /**
   * Lista de asignaciones vigentes de este vehículo en campañas no
   * finalizadas (ni borradas), cada una con su propia ventana de fechas —
   * usado por el modal de asignación de una campaña para pintar en el
   * calendario qué días están ocupados en vez de bloquear el vehículo
   * entero. `excludeCampaignVehicleId` permite ignorar la propia asignación
   * al editarla.
   */
  async getSchedule(
    vehicleId: number,
    excludeCampaignVehicleId?: number,
  ): Promise<VehicleOccupiedRange[]> {
    await this.findOneOrFail(vehicleId);
    const qb = this.vehicleRepository.manager
      .createQueryBuilder(CampaignVehicle, 'cv')
      .innerJoinAndSelect('cv.campaign', 'campaign')
      .where('cv.vehicleId = :vehicleId', { vehicleId })
      .andWhere('cv.deletedAt IS NULL')
      .andWhere('campaign.deletedAt IS NULL')
      .andWhere('campaign.finishedAt IS NULL')
      .orderBy('cv.startDate', 'ASC');

    if (excludeCampaignVehicleId) {
      qb.andWhere('cv.id != :excludeId', { excludeId: excludeCampaignVehicleId });
    }

    const rows = await qb.getMany();
    return rows.map((row) => ({
      startDate: row.startDate,
      endDate: row.endDate,
      campaignId: row.campaignId,
      campaignName: row.campaign.name,
    }));
  }

  async create(dto: CreateVehicleDto): Promise<VehicleView> {
    this.logger.log(`Creando vehículo: patente "${dto.licensePlate}"`);
    const vehicle = this.vehicleRepository.create({
      licensePlate: dto.licensePlate,
      description: dto.description ?? null,
      pricePerDay: dto.pricePerDay ?? null,
      pricePerMonth: dto.pricePerMonth ?? null,
      notes: dto.notes,
      isActive: dto.isActive,
    });
    const saved = await this.vehicleRepository.save(vehicle);
    this.logger.log(`Vehículo creado con id=${saved.id}`);
    return this.findOneViewOrFail(saved.id);
  }

  async update(id: number, dto: UpdateVehicleDto): Promise<VehicleView> {
    this.logger.log(`Actualizando vehículo id=${id}`);
    const vehicle = await this.findOneOrFail(id);
    Object.assign(vehicle, dto);
    await this.vehicleRepository.save(vehicle);
    this.logger.log(`Vehículo id=${id} actualizado correctamente`);
    return this.findOneViewOrFail(id);
  }

  async softRemove(id: number): Promise<void> {
    this.logger.log(`Eliminando (soft) vehículo id=${id}`);
    const vehicle = await this.findOneOrFail(id);
    const lockedBy = (await this.getLockedByCampaign()).get(id);
    if (lockedBy) {
      throw new BadRequestException(
        `No se puede eliminar el vehículo: está asignado a la campaña "${lockedBy.name}".`,
      );
    }
    await this.vehicleRepository.softRemove(vehicle);
    this.logger.log(`Vehículo id=${id} eliminado correctamente`);
  }
}
