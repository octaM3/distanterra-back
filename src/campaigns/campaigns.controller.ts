import {
  BadRequestException,
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
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CAMPAIGN_KINDS, CampaignKind } from '@/database/entities/campaign.entity';
import { CurrentAdmin } from '@/auth/current-admin.decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { JwtPayload } from '@/auth/jwt-payload.interface';
import { CampaignExportService } from './campaign-export.service';
import { CampaignDetail, CampaignListItem } from './campaigns.types';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ExtendCampaignDto } from './dto/extend-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/campaigns')
export class CampaignsController {
  private readonly logger = new Logger(CampaignsController.name);

  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly campaignExportService: CampaignExportService,
  ) {}

  @Get()
  async findAll(@Query('kind') kind?: string): Promise<CampaignListItem[]> {
    this.logger.debug(`GET /api/admin/campaigns${kind ? `?kind=${kind}` : ''}`);
    if (kind && !CAMPAIGN_KINDS.includes(kind as CampaignKind)) {
      throw new BadRequestException(`Tipo inválido: ${kind}`);
    }
    return this.campaignsService.findAll(kind as CampaignKind | undefined);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CampaignDetail> {
    this.logger.debug(`GET /api/admin/campaigns/${id}`);
    return this.campaignsService.getDetail(id);
  }

  @Post()
  async create(
    @Body() dto: CreateCampaignDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<CampaignListItem> {
    this.logger.log(`POST /api/admin/campaigns - nombre: "${dto.name}"`);
    return this.campaignsService.create(dto, admin.sub);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampaignDto,
  ): Promise<CampaignListItem> {
    this.logger.log(`PUT /api/admin/campaigns/${id}`);
    return this.campaignsService.update(id, dto);
  }

  @Put(':id/extend')
  async extend(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ExtendCampaignDto,
  ): Promise<CampaignListItem> {
    this.logger.log(`PUT /api/admin/campaigns/${id}/extend - nueva fecha: ${dto.newEndDate}`);
    return this.campaignsService.extend(id, dto);
  }

  @Post(':id/finish')
  async finish(@Param('id', ParseIntPipe) id: number): Promise<CampaignListItem> {
    this.logger.log(`POST /api/admin/campaigns/${id}/finish`);
    return this.campaignsService.finish(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/campaigns/${id}`);
    await this.campaignsService.softRemove(id);
    return { ok: true };
  }

  @Get(':id/export')
  async export(@Param('id', ParseIntPipe) id: number, @Res() res: Response): Promise<void> {
    this.logger.log(`GET /api/admin/campaigns/${id}/export`);
    const { buffer, filename } = await this.campaignExportService.buildWorkbook(id);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}
