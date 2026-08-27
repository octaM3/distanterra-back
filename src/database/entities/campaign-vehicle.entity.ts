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
import { Vehicle } from './vehicle.entity';

@Entity({ name: 'campaign_vehicles' })
export class CampaignVehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'campaign_id' })
  campaignId: number;

  @ManyToOne(() => Campaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Column({ type: 'int', name: 'vehicle_id' })
  vehicleId: number;

  @ManyToOne(() => Vehicle, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  // Snapshot de ambos precios del catálogo al momento de asignar, para no
  // verse afectado por cambios de precio posteriores en vehicles. El costo
  // combina los dos automáticamente (ver computeVehicleCost).
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

  // Override manual del costo total: si no es null, reemplaza el cálculo
  // automático (computeVehicleCost) como costo final de esta asignación.
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    name: 'manual_cost',
    nullable: true,
    transformer: decimalTransformer,
  })
  manualCost: number | null;

  // Rango dentro de la campaña en el que se usa el vehículo (puede ser
  // menor a la duración completa de la campaña); determina el costo real
  // (ver computeVehicleCost).
  @Column({ type: 'date', name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', name: 'end_date' })
  endDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
