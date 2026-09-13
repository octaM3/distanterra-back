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

@Entity({ name: 'employee_insurance_policies' })
export class EmployeeInsurancePolicy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'employee_id' })
  employeeId: number;

  @ManyToOne(() => Employee, (employee) => employee.insurancePolicies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // Texto libre: seguro de vida, de incapacidad, o el que corresponda según la
  // póliza contratada.
  @Column({ type: 'varchar', length: 255, name: 'insurance_type' })
  insuranceType: string;

  @Column({ type: 'date', name: 'covered_from' })
  coveredFrom: string;

  @Column({ type: 'date', name: 'covered_to' })
  coveredTo: string;

  @Column({ type: 'varchar', length: 500, name: 'file_path' })
  filePath: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
