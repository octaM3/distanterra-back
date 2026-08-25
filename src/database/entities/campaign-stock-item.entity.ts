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
import { Campaign } from './campaign.entity';
import { StockItem, StockPricingType } from './stock-item.entity';

@Entity({ name: 'campaign_stock_items' })
export class CampaignStockItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'campaign_id' })
  campaignId: number;

  @ManyToOne(() => Campaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Column({ type: 'int', name: 'stock_item_id' })
  stockItemId: number;

  @ManyToOne(() => StockItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'stock_item_id' })
  stockItem: StockItem;

  @Column({ type: 'int' })
  quantity: number;

  // Snapshot del catálogo al momento de asignar, para no verse afectado por
  // cambios de precio posteriores en stock_items.
  @Column({ type: 'varchar', length: 20, name: 'pricing_type' })
  pricingType: StockPricingType;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    name: 'unit_price',
    default: 0,
    transformer: decimalTransformer,
  })
  unitPrice: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
