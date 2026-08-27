import {
  Body,
  Controller,
  Delete,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { CampaignVehicle } from '@/database/entities/campaign-vehicle.entity';
import { CampaignVehiclesService } from './campaign-vehicles.service';
import { AssignVehicleDto } from './dto/assign-vehicle.dto';
import { UpdateCampaignVehicleDto } from './dto/update-campaign-vehicle.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/campaigns/:campaignId/vehicles')
export class CampaignVehiclesController {
  private readonly logger = new Logger(CampaignVehiclesController.name);

  constructor(private readonly campaignVehiclesService: CampaignVehiclesService) {}

  @Post()
  async assign(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Body() dto: AssignVehicleDto,
  ): Promise<CampaignVehicle> {
    this.logger.log(`POST /api/admin/campaigns/${campaignId}/vehicles`);
    return this.campaignVehiclesService.assign(campaignId, dto);
  }

  @Put(':id')
  async update(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampaignVehicleDto,
  ): Promise<CampaignVehicle> {
    this.logger.log(`PUT /api/admin/campaigns/${campaignId}/vehicles/${id}`);
    return this.campaignVehiclesService.update(campaignId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/campaigns/${campaignId}/vehicles/${id}`);
    await this.campaignVehiclesService.remove(campaignId, id);
    return { ok: true };
  }
}
