import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleOccupiedRange, VehiclesService, VehicleView } from './vehicles.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/vehicles')
export class VehiclesController {
  private readonly logger = new Logger(VehiclesController.name);

  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  async findAll(): Promise<VehicleView[]> {
    this.logger.debug('GET /api/admin/vehicles');
    return this.vehiclesService.findAll();
  }

  @Get(':id/schedule')
  async getSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Query('excludeCampaignVehicleId') excludeCampaignVehicleId?: string,
  ): Promise<VehicleOccupiedRange[]> {
    this.logger.debug(`GET /api/admin/vehicles/${id}/schedule`);
    return this.vehiclesService.getSchedule(
      id,
      excludeCampaignVehicleId ? parseInt(excludeCampaignVehicleId, 10) : undefined,
    );
  }

  @Post()
  async create(@Body() dto: CreateVehicleDto): Promise<VehicleView> {
    this.logger.log(`POST /api/admin/vehicles - patente: "${dto.licensePlate}"`);
    return this.vehiclesService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVehicleDto,
  ): Promise<VehicleView> {
    this.logger.log(`PUT /api/admin/vehicles/${id}`);
    return this.vehiclesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/vehicles/${id}`);
    await this.vehiclesService.softRemove(id);
    return { ok: true };
  }
}
