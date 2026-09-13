import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../transformers/decimal.transformer';
import { Company } from './company.entity';
import { ServiceRecord } from './service-record.entity';

export const DOCUMENT_CURRENCIES = ['ARS', 'USD'] as const;
export type DocumentCurrency = (typeof DOCUMENT_CURRENCIES)[number];

export const FINANCIAL_DOCUMENT_TYPES = [
  'factura',
  'nota_credito',
  'recibo',
  'resumen_banco',
] as const;
export type FinancialDocumentType = (typeof FINANCIAL_DOCUMENT_TYPES)[number];

@Entity({ name: 'financial_documents' })
export class FinancialDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, name: 'doc_type' })
  docType: FinancialDocumentType;

  // Obligatoria en facturas y recibos; las notas de crédito la heredan de su
  // factura y el resumen del banco no tiene empresa (ver los CHECK de la tabla).
  @Column({ type: 'int', name: 'company_id', nullable: true })
  companyId: number | null;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company | null;

  // Ítem de gestión al que pertenece la factura o el recibo: de ahí sale el
  // estado de facturación/cobro de la gestión. Las notas de crédito lo
  // alcanzan a través de su factura y el resumen del banco no tiene.
  @Column({ type: 'int', name: 'service_record_id', nullable: true })
  serviceRecordId: number | null;

  @ManyToOne(() => ServiceRecord, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'service_record_id' })
  serviceRecord: ServiceRecord | null;

  /** Solo notas de crédito: la factura que corrigen. */
  @Column({ type: 'int', name: 'invoice_id', nullable: true })
  invoiceId: number | null;

  @ManyToOne(() => FinancialDocument, (doc) => doc.creditNotes, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: FinancialDocument | null;

  @OneToMany(() => FinancialDocument, (doc) => doc.invoice)
  creditNotes: FinancialDocument[];

  /** Emisión (factura / nota de crédito) o fecha del pago (recibo). */
  @Column({ type: 'date', name: 'document_date', nullable: true })
  documentDate: string | null;

  /** Solo resumen de banco, como 'YYYY-MM' (uno por mes). */
  @Column({ type: 'varchar', length: 7, name: 'statement_month', nullable: true })
  statementMonth: string | null;

  @Column({ type: 'varchar', length: 100, name: 'document_number', nullable: true })
  documentNumber: string | null;

  // Monto facturado / cobrado: obligatorio en facturas y recibos (lo exige el
  // service), opcional en notas de crédito y sin uso en el resumen del banco.
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  amount: number | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  currency: DocumentCurrency | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 500, name: 'file_path' })
  filePath: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
