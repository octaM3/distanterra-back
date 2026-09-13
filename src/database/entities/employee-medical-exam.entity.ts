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
import { Employee } from './employee.entity';

@Entity({ name: 'employee_medical_exams' })
export class EmployeeMedicalExam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'employee_id' })
  employeeId: number;

  @ManyToOne(() => Employee, (employee) => employee.medicalExams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'date', name: 'exam_date' })
  examDate: string;

  @Column({ type: 'date', name: 'expires_at' })
  expiresAt: string;

  @Column({ type: 'varchar', length: 500, name: 'file_path' })
  filePath: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
