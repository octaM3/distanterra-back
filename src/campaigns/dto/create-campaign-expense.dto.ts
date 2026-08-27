import { Transform, Type } from 'class-transformer';
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

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

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
}
