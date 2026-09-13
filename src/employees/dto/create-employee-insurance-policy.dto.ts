import { IsDateString, IsString, MaxLength } from 'class-validator';

// Todos los campos son obligatorios, incluido el PDF (validado en el
// controller, que es donde llega el archivo).
export class CreateEmployeeInsurancePolicyDto {
  @IsString()
  @MaxLength(255)
  insuranceType: string;

  @IsDateString()
  coveredFrom: string;

  @IsDateString()
  coveredTo: string;
}
