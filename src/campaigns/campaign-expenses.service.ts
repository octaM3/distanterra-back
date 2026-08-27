import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { CampaignExpense } from '@/database/entities/campaign-expense.entity';
import { StockCategoriesService } from '@/stock-categories/stock-categories.service';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignExpenseDto } from './dto/create-campaign-expense.dto';
import { UpdateCampaignExpenseDto } from './dto/update-campaign-expense.dto';

@Injectable()
export class CampaignExpensesService {
  private readonly logger = new Logger(CampaignExpensesService.name);

  constructor(
    @InjectRepository(CampaignExpense)
    private readonly campaignExpenseRepository: Repository<CampaignExpense>,
    private readonly campaignsService: CampaignsService,
    private readonly stockCategoriesService: StockCategoriesService,
  ) {}

  async findOneOrFail(campaignId: number, id: number): Promise<CampaignExpense> {
    const expense = await this.campaignExpenseRepository.findOne({ where: { id, campaignId } });
    if (!expense) {
      this.logger.warn(`Gasto de campaña id=${id} (campaña ${campaignId}) no encontrado`);
      throw new NotFoundException(`Gasto de campaña ${id} no encontrado`);
    }
    return expense;
  }

  async create(
    campaignId: number,
    dto: CreateCampaignExpenseDto,
    invoiceImagePath: string | null,
    createdBy: number,
  ): Promise<CampaignExpense> {
    await this.campaignsService.assertCampaignEditable(campaignId);
    if (dto.categoryId != null) await this.stockCategoriesService.findOneOrFail(dto.categoryId);
    this.logger.log(
      `Creando gasto para campaña ${campaignId}: "${dto.description}" ($${dto.amount})`,
    );
    const expense = this.campaignExpenseRepository.create({
      ...dto,
      campaignId,
      invoiceImagePath,
      createdBy,
    });
    return this.campaignExpenseRepository.save(expense);
  }

  async update(
    campaignId: number,
    id: number,
    dto: UpdateCampaignExpenseDto,
    invoiceImagePath: string | undefined,
  ): Promise<CampaignExpense> {
    await this.campaignsService.assertCampaignEditable(campaignId);
    const expense = await this.findOneOrFail(campaignId, id);
    if (dto.categoryId != null) await this.stockCategoriesService.findOneOrFail(dto.categoryId);

    const previousInvoicePath = expense.invoiceImagePath;
    Object.assign(expense, dto);
    if (invoiceImagePath !== undefined) expense.invoiceImagePath = invoiceImagePath;

    this.logger.log(`Actualizando gasto de campaña id=${id}`);
    const saved = await this.campaignExpenseRepository.save(expense);

    if (
      invoiceImagePath !== undefined &&
      previousInvoicePath &&
      previousInvoicePath !== invoiceImagePath
    ) {
      await this.deleteInvoiceFile(previousInvoicePath);
    }
    return saved;
  }

  private async deleteInvoiceFile(relativePath: string): Promise<void> {
    const uploadsDir = process.env.UPLOADS_DIR ?? './uploads';
    const fullPath = join(uploadsDir, relativePath);
    try {
      await unlink(fullPath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(`No se pudo eliminar la factura ${fullPath}: ${(err as Error).message}`);
      }
    }
  }

  async remove(campaignId: number, id: number): Promise<void> {
    await this.campaignsService.assertCampaignEditable(campaignId);
    const expense = await this.findOneOrFail(campaignId, id);
    this.logger.log(`Eliminando gasto de campaña id=${id} (campaña ${campaignId})`);
    await this.campaignExpenseRepository.softRemove(expense);
  }

  /** Valida el tamaño solo por defensa en profundidad; multer ya limita el tamaño en la subida. */
  assertInvoiceFile(file: Express.Multer.File | undefined): void {
    if (file && file.size === 0) {
      throw new BadRequestException('El archivo de factura está vacío');
    }
  }
}
