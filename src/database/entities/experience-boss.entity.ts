import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Experience } from './experience.entity';

@Entity({ name: 'experience_bosses' })
export class ExperienceBoss {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'experience_id' })
  experienceId: number;

  @ManyToOne(() => Experience, (experience) => experience.bosses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'experience_id' })
  experience: Experience;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int', name: 'display_order', default: 0 })
  displayOrder: number;
}
