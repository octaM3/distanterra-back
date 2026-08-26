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
import { StockCategory } from './stock-category.entity';

export type StockPricingType = 'per_day' | 'per_month' | 'none';

@Entity({ name: 'stock_items' })
export class StockItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int', name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => StockCategory, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: StockCategory;

  @Column({ type: 'int', name: 'total_quantity', default: 0 })
  totalQuantity: number;

  // Ambos precios son independientes entre sí: un ítem pago puede tener uno,
  // el otro, o los dos a la vez (la modalidad a cobrar se elige al asignarlo
  // a una campaña puntual, ver CampaignStockItem.pricingType). Sin ninguno de
  // los dos, el ítem es gratuito (ej. cubiertos).
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    name: 'price_per_day',
    nullable: true,
    transformer: decimalTransformer,
  })
  pricePerDay: number | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    name: 'price_per_month',
    nullable: true,
    transformer: decimalTransformer,
  })
  pricePerMonth: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
