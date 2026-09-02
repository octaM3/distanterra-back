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

@Entity({ name: 'campaign_guides' })
export class CampaignGuide {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'campaign_id' })
  campaignId: number;

  @ManyToOne(() => Campaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  // Cantidad de baqueanos agregados en esta asignación; sin tope (no hay
  // catálogo ni control de inventario).
  @Column({ type: 'int' })
  quantity: number;

  // Precio por día y % de impuestos cargados directamente en el formulario
  // al agregar (no hay catálogo/configuración global). Costo = quantity *
  // pricePerDay * cantidad_de_días * (1 + taxPercentage/100), salvo
  // manualCost (ver computeGuideCost).
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
    precision: 5,
    scale: 2,
    name: 'tax_percentage',
    nullable: true,
    transformer: decimalTransformer,
  })
  taxPercentage: number | null;

  // Override manual del costo total: si no es null, reemplaza el cálculo
  // automático (computeGuideCost) como costo final de esta asignación.
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    name: 'manual_cost',
    nullable: true,
    transformer: decimalTransformer,
  })
  manualCost: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // Rango dentro de la campaña en el que se contrata a los baqueanos (puede
  // ser menor a la duración completa de la campaña, o igual a ella si se
  // elige "toda la expedición"); determina la cantidad de días que se
  // cobra (ver computeGuideCost).
  @Column({ type: 'date', name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', name: 'end_date' })
  endDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
