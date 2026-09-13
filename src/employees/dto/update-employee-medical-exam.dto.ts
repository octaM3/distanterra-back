import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeMedicalExamDto } from './create-employee-medical-exam.dto';

// El PDF sí es opcional al editar: si no se manda uno nuevo, se conserva el ya
// cargado (a diferencia del alta, donde es obligatorio).
export class UpdateEmployeeMedicalExamDto extends PartialType(CreateEmployeeMedicalExamDto) {}
