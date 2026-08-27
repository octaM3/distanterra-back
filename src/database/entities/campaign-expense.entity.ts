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

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: decimalTransformer })
  amount: number;

  @Column({ type: 'date', name: 'expense_date' })
  expenseDate: string;

  @Column({ type: 'varchar', length: 500, name: 'invoice_image_path', nullable: true })
  invoiceImagePath: string | null;

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
