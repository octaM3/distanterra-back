import {
  Body,
  Controller,
  Delete,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentAdmin } from '@/auth/current-admin.decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { JwtPayload } from '@/auth/jwt-payload.interface';
import { optimizeAndSaveImage } from '@/common/utils/image-optimizer.util';
import { buildImageMemoryMulterOptions } from '@/common/utils/file-upload.util';
import { CampaignExpense } from '@/database/entities/campaign-expense.entity';
import { CampaignExpensesService } from './campaign-expenses.service';
import { CreateCampaignExpenseDto } from './dto/create-campaign-expense.dto';
import { UpdateCampaignExpenseDto } from './dto/update-campaign-expense.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/campaigns/:campaignId/expenses')
export class CampaignExpensesController {
  private readonly logger = new Logger(CampaignExpensesController.name);

  constructor(private readonly campaignExpensesService: CampaignExpensesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('invoice', buildImageMemoryMulterOptions()))
  async create(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Body() dto: CreateCampaignExpenseDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<CampaignExpense> {
    this.logger.log(`POST /api/admin/campaigns/${campaignId}/expenses - "${dto.description}"`);
    const invoiceImagePath = file ? await optimizeAndSaveImage(file, 'invoices') : null;
    return this.campaignExpensesService.create(campaignId, dto, invoiceImagePath, admin.sub);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('invoice', buildImageMemoryMulterOptions()))
  async update(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampaignExpenseDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<CampaignExpense> {
    this.logger.log(`PUT /api/admin/campaigns/${campaignId}/expenses/${id}`);
    const invoiceImagePath = file ? await optimizeAndSaveImage(file, 'invoices') : undefined;
    return this.campaignExpensesService.update(campaignId, id, dto, invoiceImagePath);
  }

  @Delete(':id')
  async remove(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/campaigns/${campaignId}/expenses/${id}`);
    await this.campaignExpensesService.remove(campaignId, id);
    return { ok: true };
  }
}
