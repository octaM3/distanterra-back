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
import { CampaignPackAnimal } from '@/database/entities/campaign-pack-animal.entity';
import { CampaignPackAnimalsService } from './campaign-pack-animals.service';
import { AssignPackAnimalDto } from './dto/assign-pack-animal.dto';
import { UpdateCampaignPackAnimalDto } from './dto/update-campaign-pack-animal.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/campaigns/:campaignId/pack-animals')
export class CampaignPackAnimalsController {
  private readonly logger = new Logger(CampaignPackAnimalsController.name);

  constructor(private readonly campaignPackAnimalsService: CampaignPackAnimalsService) {}

  @Post()
  async assign(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Body() dto: AssignPackAnimalDto,
  ): Promise<CampaignPackAnimal> {
    this.logger.log(`POST /api/admin/campaigns/${campaignId}/pack-animals`);
    return this.campaignPackAnimalsService.assign(campaignId, dto);
  }

  @Put(':id')
  async update(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampaignPackAnimalDto,
  ): Promise<CampaignPackAnimal> {
    this.logger.log(`PUT /api/admin/campaigns/${campaignId}/pack-animals/${id}`);
    return this.campaignPackAnimalsService.update(campaignId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/campaigns/${campaignId}/pack-animals/${id}`);
    await this.campaignPackAnimalsService.remove(campaignId, id);
    return { ok: true };
  }
}
