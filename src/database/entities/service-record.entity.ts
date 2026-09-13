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
import { Campaign } from './campaign.entity';
import { Company } from './company.entity';

@Entity({ name: 'service_records' })
export class ServiceRecord {
  @PrimaryGeneratedColumn()
  id: number;

  /** Mes del servicio como 'YYYY-MM': el control es mensual, sin día. */
  @Column({ type: 'varchar', length: 7, name: 'service_month' })
  serviceMonth: string;

  @Column({ type: 'int', name: 'company_id' })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  // Solo cuando el servicio es una campaña ya cargada; los servicios sueltos
  // (alquileres, reparaciones) van sin campaña.
  @Column({ type: 'int', name: 'campaign_id', nullable: true })
  campaignId: number | null;

  @ManyToOne(() => Campaign, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign | null;

  @Column({ type: 'varchar', length: 255, name: 'service_description' })
  serviceDescription: string;

  // El estado de facturación y de cobro no se guarda: se deriva de los
  // documentos cargados (hay factura => facturado, hay recibo => cobrado),
  // ver ServiceRecordsService.toView.

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
