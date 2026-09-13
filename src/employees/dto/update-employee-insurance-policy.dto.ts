import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeInsurancePolicyDto } from './create-employee-insurance-policy.dto';

// El PDF sí es opcional al editar: si no se manda uno nuevo, se conserva el ya
// cargado (a diferencia del alta, donde es obligatorio).
export class UpdateEmployeeInsurancePolicyDto extends PartialType(
  CreateEmployeeInsurancePolicyDto,
) {}
