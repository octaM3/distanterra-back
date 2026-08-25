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
import { Admin } from './admin.entity';
import { Campaign } from './campaign.entity';

@Entity({ name: 'campaign_activity_logs' })
export class CampaignActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'campaign_id' })
  campaignId: number;

  @ManyToOne(() => Campaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Column({ type: 'date', name: 'log_date' })
  logDate: string;

  @Column({ type: 'text' })
  description: string;

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
