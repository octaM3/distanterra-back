import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { AppConfig } from '@/config/configuration';
import { deleteUploadedFile } from '@/common/utils/file-upload.util';
import { toPublicFileUrl } from '@/common/utils/public-url.util';
import {
  DocumentCurrency,
  FinancialDocument,
  FinancialDocumentType,
} from '@/database/entities/financial-document.entity';
import { ServiceRecord } from '@/database/entities/service-record.entity';
import { CreateFinancialDocumentDto } from './dto/create-financial-document.dto';
import { UpdateFinancialDocumentDto } from './dto/update-financial-document.dto';

export interface FinancialDocumentView {
  id: number;
  docType: FinancialDocumentType;
  companyId: number | null;
  companyName: string | null;
  invoiceId: number | null;
  /** Cómo se identifica la factura que corrige una nota de crédito (número o fecha). */
  invoiceLabel: string | null;
  /** Ítem de gestión al que pertenece (facturas y recibos). */
  serviceRecordId: number | null;
  serviceRecordLabel: string | null;
  documentDate: string | null;
  /** Año de archivo, derivado de la fecha del documento. */
  year: number | null;
  statementMonth: string | null;
  documentNumber: string | null;
  amount: number | null;
  currency: DocumentCurrency | null;
  description: string | null;
  notes: string | null;
  fileUrl: string | null;
  /** Solo en facturas: cuántas notas de crédito tiene asignadas. */
  creditNotesCount: number;
  createdAt: Date;
}

@Injectable()
export class FinancialDocumentsService {
  private readonly logger = new Logger(FinancialDocumentsService.name);

  constructor(
    @InjectRepository(FinancialDocument)
    private readonly documentRepository: Repository<FinancialDocument>,
    @InjectRepository(ServiceRecord)
    private readonly serviceRecordRepository: Repository<ServiceRecord>,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  /** Etiqueta legible de una factura, para mostrarla desde sus notas de crédito. */
  private invoiceLabelOf(invoice: FinancialDocument | null): string | null {
    if (!invoice) return null;
    return invoice.documentNumber
      ? `N° ${invoice.documentNumber}`
      : `Factura del ${invoice.documentDate ?? '-'}`;
  }

  private toView(doc: FinancialDocument, creditNotesCount = 0): FinancialDocumentView {
    const apiUrl = this.configService.get('apiUrl', { infer: true });
    return {
      id: doc.id,
      docType: doc.docType,
      companyId: doc.companyId,
      companyName: doc.company?.name ?? null,
      invoiceId: doc.invoiceId,
      invoiceLabel: this.invoiceLabelOf(doc.invoice),
      serviceRecordId: doc.serviceRecordId,
      serviceRecordLabel: doc.serviceRecord
        ? `${doc.serviceRecord.serviceMonth} · ${doc.serviceRecord.serviceDescription}`
        : null,
      documentDate: doc.documentDate,
      year: doc.documentDate ? Number(doc.documentDate.slice(0, 4)) : null,
      statementMonth: doc.statementMonth,
      documentNumber: doc.documentNumber,
      amount: doc.amount,
      currency: doc.currency,
      description: doc.description,
      notes: doc.notes,
      fileUrl: toPublicFileUrl(apiUrl, doc.filePath),
      creditNotesCount,
      createdAt: doc.createdAt,
    };
  }

  async findAll(docType?: FinancialDocumentType): Promise<FinancialDocumentView[]> {
    this.logger.debug(`Obteniendo documentos${docType ? ` de tipo ${docType}` : ''}`);
    const documents = await this.documentRepository.find({
      where: docType ? { docType } : {},
      relations: { company: true, invoice: true, serviceRecord: true },
      // Lo más nuevo primero: el resumen del banco se ordena por su mes, el
      // resto por la fecha del documento.
      order: { documentDate: 'DESC', statementMonth: 'DESC', createdAt: 'DESC' },
    });

    // Cuántas notas de crédito tiene cada factura, para avisarlo en el listado.
    const creditNoteRows = await this.documentRepository
      .createQueryBuilder('doc')
      .select('doc.invoice_id', 'invoiceId')
      .addSelect('COUNT(*)', 'total')
      .where('doc.doc_type = :type', { type: 'nota_credito' })
      .andWhere('doc.invoice_id IS NOT NULL')
      .andWhere('doc.deleted_at IS NULL')
      .groupBy('doc.invoice_id')
      .getRawMany<{ invoiceId: number; total: string }>();
    const countByInvoice = new Map(
      creditNoteRows.map((r) => [Number(r.invoiceId), Number(r.total)]),
    );

    return documents.map((doc) => this.toView(doc, countByInvoice.get(doc.id) ?? 0));
  }

  async findOneOrFail(id: number): Promise<FinancialDocument> {
    const doc = await this.documentRepository.findOne({
      where: { id },
      relations: { company: true, invoice: true, serviceRecord: true },
    });
    if (!doc) {
      this.logger.warn(`Documento id=${id} no encontrado`);
      throw new NotFoundException(`Documento ${id} no encontrado`);
    }
    return doc;
  }

  /**
   * Aplica las reglas propias de cada tipo y normaliza los campos que no le
   * corresponden (los mismos invariantes que garantizan los CHECK de la tabla,
   * pero fallando con un mensaje entendible en vez de un error de Postgres).
   */
  private async applyTypeRules(doc: FinancialDocument): Promise<void> {
    if (doc.docType === 'resumen_banco') {
      if (!doc.statementMonth) {
        throw new BadRequestException('El resumen del banco necesita el mes al que corresponde.');
      }
      doc.companyId = null;
      doc.invoiceId = null;
      doc.serviceRecordId = null;
      doc.documentDate = null;
      doc.amount = null;
      doc.currency = null;
      await this.assertBankStatementMonthIsFree(doc.statementMonth, doc.id);
      return;
    }

    doc.statementMonth = null;
    if (!doc.documentDate) {
      throw new BadRequestException('Falta la fecha del documento.');
    }

    if (doc.docType === 'nota_credito') {
      // Llega al ítem de gestión a través de su factura, no directamente.
      doc.serviceRecordId = null;
      if (!doc.invoiceId) {
        throw new BadRequestException(
          'La nota de crédito tiene que estar asignada a la factura que corrige.',
        );
      }
      const invoice = await this.documentRepository.findOne({ where: { id: doc.invoiceId } });
      if (!invoice) throw new NotFoundException(`Factura ${doc.invoiceId} no encontrada`);
      if (invoice.docType !== 'factura') {
        throw new BadRequestException('Una nota de crédito solo puede asignarse a una factura.');
      }
      // La empresa sale de la factura: no se carga aparte ni puede diferir.
      doc.companyId = invoice.companyId;
      return;
    }

    // Facturas y recibos pertenecen siempre a un ítem de gestión: es lo que
    // hace que el estado de facturación/cobro de la gestión tenga respaldo.
    doc.invoiceId = null;
    if (!doc.serviceRecordId) {
      throw new BadRequestException(
        'La factura y el recibo se cargan desde un ítem de gestión (sección Gestión).',
      );
    }
    const serviceRecord = await this.serviceRecordRepository.findOne({
      where: { id: doc.serviceRecordId },
    });
    if (!serviceRecord) {
      throw new NotFoundException(`Ítem de gestión ${doc.serviceRecordId} no encontrado`);
    }
    // La empresa sale del ítem de gestión: no se carga aparte ni puede diferir.
    doc.companyId = serviceRecord.companyId;
    // El monto es lo que permite ver cuánta plata falta cobrar, no solo si se cobró.
    if (doc.amount == null || !doc.currency) {
      throw new BadRequestException('Falta el monto y la moneda del comprobante.');
    }
    await this.assertRecordSlotIsFree(doc.docType, doc.serviceRecordId, doc.id);
  }

  /** Un ítem de gestión se factura una sola vez y se cobra una sola vez. */
  private async assertRecordSlotIsFree(
    docType: FinancialDocumentType,
    serviceRecordId: number,
    excludeId?: number,
  ): Promise<void> {
    const existing = await this.documentRepository.findOne({
      where: { docType, serviceRecordId, ...(excludeId ? { id: Not(excludeId) } : {}) },
    });
    if (existing) {
      throw new BadRequestException(
        docType === 'factura'
          ? 'Ese ítem de gestión ya tiene una factura cargada.'
          : 'Ese ítem de gestión ya tiene un recibo cargado.',
      );
    }
  }

  /** "Sí o sí uno solo por mes": no puede haber dos resúmenes vigentes del mismo mes. */
  private async assertBankStatementMonthIsFree(month: string, excludeId?: number): Promise<void> {
    const existing = await this.documentRepository.findOne({
      where: {
        docType: 'resumen_banco',
        statementMonth: month,
        ...(excludeId ? { id: Not(excludeId) } : {}),
      },
    });
    if (existing) {
      throw new BadRequestException(`Ya hay un resumen del banco cargado para ${month}.`);
    }
  }

  async create(dto: CreateFinancialDocumentDto, filePath: string): Promise<FinancialDocumentView> {
    const doc = this.documentRepository.create({ ...dto, filePath });
    await this.applyTypeRules(doc);
    this.logger.log(`Creando documento de tipo ${doc.docType}`);
    const saved = await this.documentRepository.save(doc);
    return this.toView(await this.findOneOrFail(saved.id));
  }

  async update(
    id: number,
    dto: UpdateFinancialDocumentDto,
    filePath: string | undefined,
  ): Promise<FinancialDocumentView> {
    const doc = await this.findOneOrFail(id);
    const previousFilePath = doc.filePath;

    Object.assign(doc, dto);
    if (filePath !== undefined) doc.filePath = filePath;
    await this.applyTypeRules(doc);

    this.logger.log(`Actualizando documento id=${id}`);
    await this.documentRepository.save(doc);

    if (filePath !== undefined && previousFilePath !== filePath) {
      await deleteUploadedFile(previousFilePath);
    }
    return this.toView(await this.findOneOrFail(id));
  }

  async softRemove(id: number): Promise<void> {
    const doc = await this.findOneOrFail(id);
    if (doc.docType === 'factura') {
      // Una nota de crédito no puede quedar sin su factura (ver el FK RESTRICT).
      const creditNotes = await this.documentRepository.count({
        where: { docType: 'nota_credito', invoiceId: id, deletedAt: IsNull() },
      });
      if (creditNotes > 0) {
        throw new BadRequestException(
          'No se puede eliminar la factura: tiene notas de crédito asignadas. Eliminá primero esas notas.',
        );
      }
    }
    this.logger.log(`Eliminando (soft) documento id=${id}`);
    await this.documentRepository.softRemove(doc);
  }
}
