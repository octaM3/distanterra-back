import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExperienceBoss } from './experience-boss.entity';
import { ExperienceDescriptionBlock } from './experience-description-block';

@Entity({ name: 'experiences' })
export class Experience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, name: 'title_es' })
  titleEs: string;

  @Column({ type: 'varchar', length: 255, name: 'title_en' })
  titleEn: string;

  @Column({ type: 'varchar', length: 255, name: 'location_es', nullable: true })
  locationEs: string | null;

  @Column({ type: 'varchar', length: 255, name: 'location_en', nullable: true })
  locationEn: string | null;

  @Column({ type: 'jsonb', name: 'description_es', default: [] })
  descriptionEs: ExperienceDescriptionBlock[];

  @Column({ type: 'jsonb', name: 'description_en', default: [] })
  descriptionEn: ExperienceDescriptionBlock[];

  @Column({ type: 'int', name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ExperienceBoss, (boss) => boss.experience, {
    cascade: true,
  })
  bosses: ExperienceBoss[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
