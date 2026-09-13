import { EmploymentStatus } from '@/database/entities/employee.entity';

export interface EmployeeMedicalExamView {
  id: number;
  examDate: string;
  expiresAt: string;
  fileUrl: string | null;
  createdAt: Date;
}

export interface EmployeeInsurancePolicyView {
  id: number;
  insuranceType: string;
  coveredFrom: string;
  coveredTo: string;
  fileUrl: string | null;
  createdAt: Date;
}

export interface EmployeeListItem {
  id: number;
  fullName: string;
  dni: string;
  birthDate: string;
  hasPpe: boolean;
  employmentStatus: EmploymentStatus | null;
  dailyRateArs: number | null;
  dailyRateUsd: number | null;
  // Vencimiento más lejano cargado de cada tipo de documentación, para poder
  // avisar en el listado quién tiene algo vencido sin abrir el detalle.
  medicalExamExpiresAt: string | null;
  insuranceCoveredTo: string | null;
  createdAt: Date;
}

export interface EmployeeDetail extends EmployeeListItem {
  dniFrontUrl: string | null;
  dniBackUrl: string | null;
  bankCvu: string | null;
  bankAlias: string | null;
  bankHolder: string | null;
  notes: string | null;
  medicalExams: EmployeeMedicalExamView[];
  insurancePolicies: EmployeeInsurancePolicyView[];
  updatedAt: Date;
}
