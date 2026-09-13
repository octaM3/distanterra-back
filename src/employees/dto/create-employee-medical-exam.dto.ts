import { IsDateString } from 'class-validator';

// Todos los campos son obligatorios, incluido el PDF (validado en el
// controller, que es donde llega el archivo).
export class CreateEmployeeMedicalExamDto {
  @IsDateString()
  examDate: string;

  @IsDateString()
  expiresAt: string;
}
