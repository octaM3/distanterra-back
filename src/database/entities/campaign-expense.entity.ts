import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../transformers/decimal.transformer';
import { Admin } from './admin.entity';
import { Campaign } from './campaign.entity';
import { StockCategory } from './stock-category.entity';

export const INVOICE_TYPES = [
  'Factura A',
  'Factura B',
  'Factura C',
  'Factura E',
  'Factura T',
  'Factura M',
] as const;
export type InvoiceType = (typeof INVOICE_TYPES)[number];

@Entity({ name: 'campaign_expenses' })
export class CampaignExpense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'campaign_id' })
  campaignId: number;

  @ManyToOne(() => Campaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'int', name: 'category_id', nullable: true })
  categoryId: number | null;

  @ManyToOne(() => StockCategory, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: StockCategory | null;

  // Monto opcional en cada moneda: un gasto puede cargarse en USD, en ARS, o
  // en ambas (el service exige al menos una de las dos, ver
  // CampaignExpensesService.create/update).
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    name: 'amount_usd',
    nullable: true,
    transformer: decimalTransformer,
  })
  amountUsd: number | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    name: 'amount_ars',
    nullable: true,
    transformer: decimalTransformer,
  })
  amountArs: number | null;

  @Column({ type: 'date', name: 'expense_date' })
  expenseDate: string;

  @Column({ type: 'varchar', length: 500, name: 'invoice_image_path', nullable: true })
  invoiceImagePath: string | null;

  @Column({ type: 'varchar', length: 20, name: 'invoice_type', nullable: true })
  invoiceType: InvoiceType | null;

  // Número/ID de factura tal como lo identifica el proveedor (texto libre;
  // distinto de invoiceType, que es la letra de factura AFIP).
  @Column({ type: 'varchar', length: 100, name: 'invoice_number', nullable: true })
  invoiceNumber: string | null;

  @Column({ type: 'varchar', length: 255, name: 'business_name', nullable: true })
  businessName: string | null;

  @Column({ type: 'int', name: 'created_by', nullable: true })
  createdBy: number | null;

  @ManyToOne(() => Admin, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdByAdmin: Admin | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
