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
import { CampaignGuide } from '@/database/entities/campaign-guide.entity';
import { CampaignGuidesService } from './campaign-guides.service';
import { AssignGuideDto } from './dto/assign-guide.dto';
import { UpdateCampaignGuideDto } from './dto/update-campaign-guide.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/campaigns/:campaignId/guides')
export class CampaignGuidesController {
  private readonly logger = new Logger(CampaignGuidesController.name);

  constructor(private readonly campaignGuidesService: CampaignGuidesService) {}

  @Post()
  async assign(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Body() dto: AssignGuideDto,
  ): Promise<CampaignGuide> {
    this.logger.log(`POST /api/admin/campaigns/${campaignId}/guides`);
    return this.campaignGuidesService.assign(campaignId, dto);
  }

  @Put(':id')
  async update(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampaignGuideDto,
  ): Promise<CampaignGuide> {
    this.logger.log(`PUT /api/admin/campaigns/${campaignId}/guides/${id}`);
    return this.campaignGuidesService.update(campaignId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/campaigns/${campaignId}/guides/${id}`);
    await this.campaignGuidesService.remove(campaignId, id);
    return { ok: true };
  }
}
