import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../transformers/decimal.transformer';
import { EmployeeInsurancePolicy } from './employee-insurance-policy.entity';
import { EmployeeMedicalExam } from './employee-medical-exam.entity';

export const EMPLOYMENT_STATUSES = ['Monotributo', 'Mes de prueba', 'En blanco'] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

@Entity({ name: 'employees' })
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 20 })
  dni: string;

  @Column({ type: 'date', name: 'birth_date' })
  birthDate: string;

  @Column({ type: 'varchar', length: 500, name: 'dni_front_image_path', nullable: true })
  dniFrontImagePath: string | null;

  @Column({ type: 'varchar', length: 500, name: 'dni_back_image_path', nullable: true })
  dniBackImagePath: string | null;

  @Column({ type: 'boolean', name: 'has_ppe', default: false })
  hasPpe: boolean;

  @Column({ type: 'varchar', length: 30, name: 'employment_status', nullable: true })
  employmentStatus: EmploymentStatus | null;

  @Column({ type: 'varchar', length: 50, name: 'bank_cvu', nullable: true })
  bankCvu: string | null;

  @Column({ type: 'varchar', length: 100, name: 'bank_alias', nullable: true })
  bankAlias: string | null;

  @Column({ type: 'varchar', length: 255, name: 'bank_holder', nullable: true })
  bankHolder: string | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    name: 'daily_rate_ars',
    nullable: true,
    transformer: decimalTransformer,
  })
  dailyRateArs: number | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    name: 'daily_rate_usd',
    nullable: true,
    transformer: decimalTransformer,
  })
  dailyRateUsd: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => EmployeeMedicalExam, (exam) => exam.employee)
  medicalExams: EmployeeMedicalExam[];

  @OneToMany(() => EmployeeInsurancePolicy, (policy) => policy.employee)
  insurancePolicies: EmployeeInsurancePolicy[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
