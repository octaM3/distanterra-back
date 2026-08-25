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
import { CampaignStockItem } from '@/database/entities/campaign-stock-item.entity';
import { CampaignStockService } from './campaign-stock.service';
import { AssignStockItemDto } from './dto/assign-stock-item.dto';
import { UpdateCampaignStockItemDto } from './dto/update-campaign-stock-item.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/campaigns/:campaignId/stock-items')
export class CampaignStockController {
  private readonly logger = new Logger(CampaignStockController.name);

  constructor(private readonly campaignStockService: CampaignStockService) {}

  @Post()
  async assign(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Body() dto: AssignStockItemDto,
  ): Promise<CampaignStockItem> {
    this.logger.log(`POST /api/admin/campaigns/${campaignId}/stock-items`);
    return this.campaignStockService.assign(campaignId, dto);
  }

  @Put(':id')
  async update(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampaignStockItemDto,
  ): Promise<CampaignStockItem> {
    this.logger.log(`PUT /api/admin/campaigns/${campaignId}/stock-items/${id}`);
    return this.campaignStockService.update(campaignId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/campaigns/${campaignId}/stock-items/${id}`);
    await this.campaignStockService.remove(campaignId, id);
    return { ok: true };
  }
}
