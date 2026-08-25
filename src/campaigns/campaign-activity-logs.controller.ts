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
import { CurrentAdmin } from '@/auth/current-admin.decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { JwtPayload } from '@/auth/jwt-payload.interface';
import { CampaignActivityLog } from '@/database/entities/campaign-activity-log.entity';
import { CampaignActivityLogsService } from './campaign-activity-logs.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/campaigns/:campaignId/activity-logs')
export class CampaignActivityLogsController {
  private readonly logger = new Logger(CampaignActivityLogsController.name);

  constructor(private readonly campaignActivityLogsService: CampaignActivityLogsService) {}

  @Post()
  async create(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Body() dto: CreateActivityLogDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<CampaignActivityLog> {
    this.logger.log(`POST /api/admin/campaigns/${campaignId}/activity-logs`);
    return this.campaignActivityLogsService.create(campaignId, dto, admin.sub);
  }

  @Put(':id')
  async update(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateActivityLogDto,
  ): Promise<CampaignActivityLog> {
    this.logger.log(`PUT /api/admin/campaigns/${campaignId}/activity-logs/${id}`);
    return this.campaignActivityLogsService.update(campaignId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/campaigns/${campaignId}/activity-logs/${id}`);
    await this.campaignActivityLogsService.remove(campaignId, id);
    return { ok: true };
  }
}
