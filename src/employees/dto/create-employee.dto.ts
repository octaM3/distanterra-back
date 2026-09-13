import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { EMPLOYMENT_STATUSES, EmploymentStatus } from '@/database/entities/employee.entity';

// Los datos del empleado viajan como multipart (junto a las fotos del DNI),
// así que todo llega como string: "" significa "sin valor" y el campo ausente
// significa "no tocar" en un update (PartialType). Mismo patrón que los gastos
// extra de campaña.
const toOptionalNumber = ({ value }: { value: unknown }) =>
  value === '' ? null : value === undefined ? undefined : Number(value);

const toOptionalString = ({ value }: { value: unknown }) => (value === '' ? null : value);

export class CreateEmployeeDto {
  @IsString()
  @MaxLength(255)
  fullName: string;

  @IsString()
  @MaxLength(20)
  dni: string;

  @IsDateString()
  birthDate: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasPpe?: boolean;

  @IsOptional()
  @Transform(toOptionalString)
  @IsIn(EMPLOYMENT_STATUSES)
  employmentStatus?: EmploymentStatus | null;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  @MaxLength(50)
  bankCvu?: string | null;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  @MaxLength(100)
  bankAlias?: string | null;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  @MaxLength(255)
  bankHolder?: string | null;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  dailyRateArs?: number | null;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  dailyRateUsd?: number | null;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  notes?: string | null;
}
