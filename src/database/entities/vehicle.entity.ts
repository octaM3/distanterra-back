import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../transformers/decimal.transformer';

@Entity({ name: 'vehicles' })
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, name: 'license_plate', unique: true })
  licensePlate: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  // Independientes entre sí: un vehículo puede tener uno o los dos a la vez.
  // Al asignarlo a una campaña puntual, el costo se calcula automáticamente
  // combinando ambos (ver computeVehicleCost). No hay un precio de "campaña
  // completa" aparte: para eso se asigna con duración "toda la expedición".
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
