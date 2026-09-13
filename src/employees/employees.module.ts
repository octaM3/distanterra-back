import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '@/database/entities/employee.entity';
import { EmployeeInsurancePolicy } from '@/database/entities/employee-insurance-policy.entity';
import { EmployeeMedicalExam } from '@/database/entities/employee-medical-exam.entity';
import { EmployeeInsurancePoliciesController } from './employee-insurance-policies.controller';
import { EmployeeInsurancePoliciesService } from './employee-insurance-policies.service';
import { EmployeeMedicalExamsController } from './employee-medical-exams.controller';
import { EmployeeMedicalExamsService } from './employee-medical-exams.service';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, EmployeeMedicalExam, EmployeeInsurancePolicy])],
  controllers: [
    EmployeesController,
    EmployeeMedicalExamsController,
    EmployeeInsurancePoliciesController,
  ],
  providers: [EmployeesService, EmployeeMedicalExamsService, EmployeeInsurancePoliciesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
