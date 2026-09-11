import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { INVOICE_TYPES, InvoiceType } from '@/database/entities/campaign-expense.entity';

// "" (campo de monto vacío en el form, ya que ambos son opcionales) se
// normaliza a null explícito; el campo directamente ausente del body
// significa "no tocar" en un update (PartialType). Mismo patrón que
// categoryId más abajo.
const toOptionalNumber = ({ value }: { value: unknown }) =>
  value === '' ? null : value === undefined ? undefined : Number(value);

export class CreateCampaignExpenseDto {
  @IsString()
  @MaxLength(255)
  description: string;

  // "" (desde el <select> del form, "Sin categoría") se normaliza a null
  // explícito para poder limpiar la categoría en un update; el campo
  // directamente ausente en el body significa "no tocar" (PartialType).
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value === undefined ? undefined : Number(value)))
  @IsInt()
  categoryId?: number | null;

  // Al menos uno de los dos debe tener valor (validado en el service, no
  // acá: es una regla cruzada entre dos campos).
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  amountUsd?: number | null;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  amountArs?: number | null;

  @IsDateString()
  expenseDate: string;

  // "" (desde el <select> del form, "Sin especificar") se normaliza a null,
  // igual que categoryId arriba.
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsIn(INVOICE_TYPES)
  invoiceType?: InvoiceType | null;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  @MaxLength(255)
  businessName?: string | null;

  // Número/ID de factura del proveedor (texto libre; no confundir con
  // invoiceType, que es la letra de factura AFIP).
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  @MaxLength(100)
  invoiceNumber?: string | null;
}
