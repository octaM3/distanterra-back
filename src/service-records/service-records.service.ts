import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/config/configuration';
import { toPublicFileUrl } from '@/common/utils/public-url.util';
import { Campaign } from '@/database/entities/campaign.entity';
import {
  DocumentCurrency,
  FinancialDocument,
} from '@/database/entities/financial-document.entity';
import { ServiceRecord } from '@/database/entities/service-record.entity';
import { UpdateServiceRecordDto } from './dto/update-service-record.dto';

export interface ServiceRecordView {
  id: number;
  serviceMonth: string;
  companyId: number;
  companyName: string;
  campaignId: number | null;
  campaignName: string | null;
  serviceDescription: string;
  // Estado derivado de los documentos cargados: hay factura => facturado,
  // hay recibo => cobrado. No se puede marcar a mano.
  invoiceSent: boolean;
  invoiceSentAt: string | null;
  invoiceDocumentId: number | null;
  invoiceFileUrl: string | null;
  invoiceNumber: string | null;
  invoiceAmount: number | null;
  invoiceCurrency: DocumentCurrency | null;
  paymentReceived: boolean;
  paymentReceivedAt: string | null;
  receiptDocumentId: number | null;
  receiptFileUrl: string | null;
  receiptAmount: number | null;
  receiptCurrency: DocumentCurrency | null;
  creditNotesCount: number;
  notes: string | null;
  createdAt: Date;
}

@Injectable()
export class ServiceRecordsService {
  private readonly logger = new Logger(ServiceRecordsService.name);

  constructor(
    @InjectRepository(ServiceRecord)
    private readonly serviceRecordRepository: Repository<ServiceRecord>,
    @InjectRepository(FinancialDocument)
    private readonly documentRepository: Repository<FinancialDocument>,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  /** Factura y recibo (si están) de cada ítem de gestión: de ahí sale su estado. */
  private async getDocumentsByRecord(
    recordIds: number[],
  ): Promise<Map<number, { invoice?: FinancialDocument; receipt?: FinancialDocument }>> {
    const map = new Map<number, { invoice?: FinancialDocument; receipt?: FinancialDocument }>();
    if (recordIds.length === 0) return map;

    const documents = await this.documentRepository.find({
      where: { serviceRecordId: In(recordIds) },
    });
    for (const doc of documents) {
      if (doc.serviceRecordId == null) continue;
      const entry = map.get(doc.serviceRecordId) ?? {};
      if (doc.docType === 'factura') entry.invoice = doc;
      if (doc.docType === 'recibo') entry.receipt = doc;
      map.set(doc.serviceRecordId, entry);
    }
    return map;
  }

  /** Cuántas notas de crédito tiene cada factura, para avisarlo en el control. */
  private async getCreditNoteCounts(invoiceIds: number[]): Promise<Map<number, number>> {
    if (invoiceIds.length === 0) return new Map();
    const rows = await this.documentRepository
      .createQueryBuilder('doc')
      .select('doc.invoice_id', 'invoiceId')
      .addSelect('COUNT(*)', 'total')
      .where('doc.doc_type = :type', { type: 'nota_credito' })
      .andWhere('doc.invoice_id IN (:...invoiceIds)', { invoiceIds })
      .andWhere('doc.deleted_at IS NULL')
      .groupBy('doc.invoice_id')
      .getRawMany<{ invoiceId: number; total: string }>();
    return new Map(rows.map((r) => [Number(r.invoiceId), Number(r.total)]));
  }

  private toView(
    record: ServiceRecord,
    documents: { invoice?: FinancialDocument; receipt?: FinancialDocument } | undefined,
    creditNotesCount: number,
  ): ServiceRecordView {
    const apiUrl = this.configService.get('apiUrl', { infer: true });
    const invoice = documents?.invoice;
    const receipt = documents?.receipt;
    return {
      id: record.id,
      serviceMonth: record.serviceMonth,
      companyId: record.companyId,
      companyName: record.company?.name ?? '',
      campaignId: record.campaignId,
      campaignName: record.campaign?.name ?? null,
      serviceDescription: record.serviceDescription,
      invoiceSent: Boolean(invoice),
      invoiceSentAt: invoice?.documentDate ?? null,
      invoiceDocumentId: invoice?.id ?? null,
      invoiceFileUrl: toPublicFileUrl(apiUrl, invoice?.filePath ?? null),
      invoiceNumber: invoice?.documentNumber ?? null,
      invoiceAmount: invoice?.amount ?? null,
      invoiceCurrency: invoice?.currency ?? null,
      paymentReceived: Boolean(receipt),
      paymentReceivedAt: receipt?.documentDate ?? null,
      receiptDocumentId: receipt?.id ?? null,
      receiptFileUrl: toPublicFileUrl(apiUrl, receipt?.filePath ?? null),
      receiptAmount: receipt?.amount ?? null,
      receiptCurrency: receipt?.currency ?? null,
      creditNotesCount,
      notes: record.notes,
      createdAt: record.createdAt,
    };
  }

  async findAll(): Promise<ServiceRecordView[]> {
    this.logger.debug('Obteniendo el control de servicios');
    const records = await this.serviceRecordRepository.find({
      relations: { company: true, campaign: true },
      // Del mes más reciente al más viejo: el control se mira de lo último hacia atrás.
      order: { serviceMonth: 'DESC', createdAt: 'DESC' },
    });

    const documentsByRecord = await this.getDocumentsByRecord(records.map((r) => r.id));
    const invoiceIds = Array.from(documentsByRecord.values())
      .map((entry) => entry.invoice?.id)
      .filter((id): id is number => id != null);
    const creditNotesByInvoice = await this.getCreditNoteCounts(invoiceIds);

    return records.map((record) => {
      const documents = documentsByRecord.get(record.id);
      const creditNotes = documents?.invoice
        ? (creditNotesByInvoice.get(documents.invoice.id) ?? 0)
        : 0;
      return this.toView(record, documents, creditNotes);
    });
  }

  private async toViewById(id: number): Promise<ServiceRecordView> {
    const record = await this.findOneOrFail(id);
    const documents = (await this.getDocumentsByRecord([id])).get(id);
    const creditNotes = documents?.invoice
      ? ((await this.getCreditNoteCounts([documents.invoice.id])).get(documents.invoice.id) ?? 0)
      : 0;
    return this.toView(record, documents, creditNotes);
  }

  async findOneOrFail(id: number): Promise<ServiceRecord> {
    const record = await this.serviceRecordRepository.findOne({
      where: { id },
      relations: { company: true, campaign: true },
    });
    if (!record) {
      this.logger.warn(`Registro de servicio id=${id} no encontrado`);
      throw new NotFoundException(`Registro de servicio ${id} no encontrado`);
    }
    return record;
  }

  /**
   * Ítem de gestión de una campaña o servicio recién creado. Los registros no
   * se cargan a mano: nacen con la campaña/servicio, así ninguno queda fuera
   * del control de facturación.
   */
  async createForCampaign(campaign: Campaign): Promise<void> {
    const record = this.serviceRecordRepository.create({
      serviceMonth: campaign.startDate.slice(0, 7),
      companyId: campaign.companyId,
      campaignId: campaign.id,
      // En una campaña la descripción es genérica (el nombre se muestra desde
      // la campaña vinculada); un servicio suelto se describe con su nombre.
      serviceDescription: campaign.kind === 'servicio' ? campaign.name : 'Campaña',
    });
    await this.serviceRecordRepository.save(record);
    this.logger.log(`Ítem de gestión creado para la campaña/servicio id=${campaign.id}`);
  }

  /** Al eliminar la campaña/servicio se va también su ítem de gestión, salvo que tenga archivos. */
  async removeForCampaign(campaignId: number): Promise<void> {
    const record = await this.serviceRecordRepository.findOne({ where: { campaignId } });
    if (!record) return;
    const documents = await this.documentRepository.count({
      where: { serviceRecordId: record.id, deletedAt: IsNull() },
    });
    if (documents > 0) {
      throw new BadRequestException(
        'No se puede eliminar: su ítem de gestión tiene archivos cargados (factura o recibo). Eliminá primero esos archivos.',
      );
    }
    await this.serviceRecordRepository.softRemove(record);
    this.logger.log(`Ítem de gestión de la campaña/servicio id=${campaignId} eliminado`);
  }

  /** Ítem de gestión de una campaña/servicio, para incluir su facturación en el Excel. */
  async findViewByCampaign(campaignId: number): Promise<ServiceRecordView | null> {
    const record = await this.serviceRecordRepository.findOne({ where: { campaignId } });
    return record ? this.toViewById(record.id) : null;
  }

  /**
   * Lo único editable del ítem: el mes al que se imputa y las notas. La
   * empresa, la campaña y la descripción vienen de la campaña/servicio, así no
   * pueden quedar diciendo algo distinto que los documentos ya emitidos.
   */
  async update(id: number, dto: UpdateServiceRecordDto): Promise<ServiceRecordView> {
    const record = await this.findOneOrFail(id);
    Object.assign(record, dto);

    this.logger.log(`Actualizando registro de servicio id=${id}`);
    await this.serviceRecordRepository.save(record);
    return this.toViewById(id);
  }
}
