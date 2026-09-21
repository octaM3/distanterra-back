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
import { Company } from './company.entity';

export const CAMPAIGN_KINDS = ['campana', 'servicio'] as const;
export type CampaignKind = (typeof CAMPAIGN_KINDS)[number];

export const CAMPAIGN_APPROVAL_STATUSES = ['presupuesto', 'aprobada', 'rechazada'] as const;
export type CampaignApprovalStatus = (typeof CAMPAIGN_APPROVAL_STATUSES)[number];

/**
 * Único estado en el que las asignaciones de una campaña reservan el recurso.
 * Un presupuesto se arma con stock y vehículos como cualquier campaña, pero
 * mientras el cliente no lo apruebe no le saca disponibilidad a nadie: si
 * reservara, un presupuesto que nunca se cierra dejaría el equipamiento
 * bloqueado sin que haya trabajo detrás. La contracara es que al aprobarlo
 * hay que revalidar (ver CampaignsService.approve).
 */
export const RESERVING_APPROVAL_STATUS: CampaignApprovalStatus = 'aprobada';

@Entity({ name: 'campaigns' })
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  // Un "servicio" es un alquiler suelto (camioneta, Starlink): usa las mismas
  // asignaciones de stock y vehículos que una campaña —y por lo tanto el mismo
  // control de disponibilidad— pero sin baqueanos, gastos ni bitácora.
  @Column({ type: 'varchar', length: 20, default: 'campana' })
  kind: CampaignKind;

  // Un presupuesto es una campaña (o un servicio) que el cliente todavía no
  // aprobó: se arma entera, con todas sus asignaciones, pero no reserva stock
  // ni vehículos hasta que se aprueba. Aprobar es solo cambiar este estado.
  // Es independiente de `kind`: se presupuestan las dos cosas.
  @Column({ type: 'varchar', length: 20, name: 'approval_status', default: 'aprobada' })
  approvalStatus: CampaignApprovalStatus;

  @Column({ type: 'timestamptz', name: 'approved_at', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'timestamptz', name: 'rejected_at', nullable: true })
  rejectedAt: Date | null;

  // IVA que se le suma al presupuesto en el PDF del cliente. Vive acá y no en
  // cada asignación porque es del documento, no del recurso: los costos
  // internos de la campaña se siguen calculando sin impuesto.
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    name: 'tax_percentage',
    nullable: true,
    transformer: decimalTransformer,
  })
  taxPercentage: number | null;

  @Column({ type: 'int', name: 'company_id' })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'date', name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', name: 'end_date' })
  endDate: string;

  @Column({ type: 'timestamptz', name: 'finished_at', nullable: true })
  finishedAt: Date | null;

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
