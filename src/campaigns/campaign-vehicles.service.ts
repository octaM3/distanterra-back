import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignVehicle } from '@/database/entities/campaign-vehicle.entity';
import { VehiclesService } from '@/vehicles/vehicles.service';
import { validateAssignmentDateRange } from './campaigns.util';
import { CampaignsService } from './campaigns.service';
import { AssignVehicleDto } from './dto/assign-vehicle.dto';
import { UpdateCampaignVehicleDto } from './dto/update-campaign-vehicle.dto';

@Injectable()
export class CampaignVehiclesService {
  private readonly logger = new Logger(CampaignVehiclesService.name);

  constructor(
    @InjectRepository(CampaignVehicle)
    private readonly campaignVehicleRepository: Repository<CampaignVehicle>,
    private readonly campaignsService: CampaignsService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  async findOneOrFail(campaignId: number, id: number): Promise<CampaignVehicle> {
    const row = await this.campaignVehicleRepository.findOne({ where: { id, campaignId } });
    if (!row) {
      this.logger.warn(`Vehículo de campaña id=${id} (campaña ${campaignId}) no encontrado`);
      throw new NotFoundException(`Vehículo de campaña ${id} no encontrado`);
    }
    return row;
  }

  async assign(campaignId: number, dto: AssignVehicleDto): Promise<CampaignVehicle> {
    const campaign = await this.campaignsService.assertCampaignEditable(campaignId);
    const vehicle = await this.vehiclesService.findOneOrFail(dto.vehicleId);

    validateAssignmentDateRange(campaign, dto.startDate, dto.endDate);

    // La disponibilidad se chequea solo contra la ventana de uso pedida: el
    // mismo vehículo puede estar asignado a otra campaña siempre que no se
    // superponga con estas fechas (ver isAvailable).
    const available = await this.vehiclesService.isAvailable(
      dto.vehicleId,
      dto.startDate,
      dto.endDate,
    );
    if (!available) {
      throw new BadRequestException(
        `El vehículo "${vehicle.licensePlate}" ya está asignado a otra campaña entre el ${dto.startDate} y el ${dto.endDate}.`,
      );
    }

    this.logger.log(
      `Asignando vehículo "${vehicle.licensePlate}" a la campaña ${campaignId} (${dto.startDate} a ${dto.endDate})`,
    );
    const row = this.campaignVehicleRepository.create({
      campaignId,
      vehicleId: dto.vehicleId,
      manualCost: dto.manualCost ?? null,
      pricePerDay: vehicle.pricePerDay,
      pricePerMonth: vehicle.pricePerMonth,
      startDate: dto.startDate,
      endDate: dto.endDate,
      notes: dto.notes ?? null,
    });
    return this.campaignVehicleRepository.save(row);
  }

  async update(
    campaignId: number,
    id: number,
    dto: UpdateCampaignVehicleDto,
  ): Promise<CampaignVehicle> {
    const campaign = await this.campaignsService.assertCampaignEditable(campaignId);
    const row = await this.findOneOrFail(campaignId, id);

    const nextStart = dto.startDate ?? row.startDate;
    const nextEnd = dto.endDate ?? row.endDate;
    const datesChanged = nextStart !== row.startDate || nextEnd !== row.endDate;

    if (datesChanged) {
      validateAssignmentDateRange(campaign, nextStart, nextEnd);

      // Cambiar el rango puede hacer que esta asignación pase a
      // superponerse con otra: hay que re-chequear disponibilidad.
      const available = await this.vehiclesService.isAvailable(
        row.vehicleId,
        nextStart,
        nextEnd,
        row.id,
      );
      if (!available) {
        throw new BadRequestException(
          `El vehículo ya está asignado a otra campaña entre el ${nextStart} y el ${nextEnd}.`,
        );
      }

      row.startDate = nextStart;
      row.endDate = nextEnd;
    }

    if (dto.manualCost !== undefined) row.manualCost = dto.manualCost;
    if (dto.notes !== undefined) row.notes = dto.notes;

    this.logger.log(`Actualizando vehículo de campaña id=${id}`);
    return this.campaignVehicleRepository.save(row);
  }

  async remove(campaignId: number, id: number): Promise<void> {
    await this.campaignsService.assertCampaignEditable(campaignId);
    const row = await this.findOneOrFail(campaignId, id);
    this.logger.log(`Liberando vehículo de campaña id=${id} (campaña ${campaignId})`);
    await this.campaignVehicleRepository.softRemove(row);
  }
}
