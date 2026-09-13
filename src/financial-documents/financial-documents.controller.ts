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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { buildPdfMemoryMulterOptions, saveRawFile } from '@/common/utils/file-upload.util';
import {
  FINANCIAL_DOCUMENT_TYPES,
  FinancialDocumentType,
} from '@/database/entities/financial-document.entity';
import { CreateFinancialDocumentDto } from './dto/create-financial-document.dto';
import { UpdateFinancialDocumentDto } from './dto/update-financial-document.dto';
import { FinancialDocumentsService, FinancialDocumentView } from './financial-documents.service';

// Cada tipo va a su propia subcarpeta de uploads, para que el repositorio
// quede ordenado también en disco.
const SUBFOLDER_BY_TYPE: Record<FinancialDocumentType, string> = {
  factura: 'documents/facturas',
  nota_credito: 'documents/notas-credito',
  recibo: 'documents/recibos',
  resumen_banco: 'documents/resumenes-banco',
};

@UseGuards(JwtAuthGuard)
@Controller('admin/financial-documents')
export class FinancialDocumentsController {
  private readonly logger = new Logger(FinancialDocumentsController.name);

  constructor(private readonly documentsService: FinancialDocumentsService) {}

  @Get()
  async findAll(@Query('docType') docType?: string): Promise<FinancialDocumentView[]> {
    this.logger.debug(`GET /api/admin/financial-documents${docType ? `?docType=${docType}` : ''}`);
    if (docType && !FINANCIAL_DOCUMENT_TYPES.includes(docType as FinancialDocumentType)) {
      throw new BadRequestException(`Tipo de documento inválido: ${docType}`);
    }
    return this.documentsService.findAll(docType as FinancialDocumentType | undefined);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', buildPdfMemoryMulterOptions()))
  async create(
    @Body() dto: CreateFinancialDocumentDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<FinancialDocumentView> {
    this.logger.log(`POST /api/admin/financial-documents - tipo ${dto.docType}`);
    if (!file) throw new BadRequestException('El archivo PDF es obligatorio.');
    const filePath = await saveRawFile(file, SUBFOLDER_BY_TYPE[dto.docType]);
    return this.documentsService.create(dto, filePath);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file', buildPdfMemoryMulterOptions()))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFinancialDocumentDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<FinancialDocumentView> {
    this.logger.log(`PUT /api/admin/financial-documents/${id}`);
    const existing = await this.documentsService.findOneOrFail(id);
    const filePath = file
      ? await saveRawFile(file, SUBFOLDER_BY_TYPE[dto.docType ?? existing.docType])
      : undefined;
    return this.documentsService.update(id, dto, filePath);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/financial-documents/${id}`);
    await this.documentsService.softRemove(id);
    return { ok: true };
  }
}
