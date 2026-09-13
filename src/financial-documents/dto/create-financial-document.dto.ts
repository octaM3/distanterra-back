import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import {
  DOCUMENT_CURRENCIES,
  DocumentCurrency,
  FINANCIAL_DOCUMENT_TYPES,
  FinancialDocumentType,
} from '@/database/entities/financial-document.entity';

// Todo llega como multipart (va junto al PDF), así que los números vienen como
// string y "" significa "sin valor".
const toOptionalInt = ({ value }: { value: unknown }) =>
  value === '' || value == null ? null : Number(value);

const toOptionalString = ({ value }: { value: unknown }) => (value === '' ? null : value);

export class CreateFinancialDocumentDto {
  @IsIn(FINANCIAL_DOCUMENT_TYPES)
  docType: FinancialDocumentType;

  // La combinación válida de campos según el tipo se valida en el service
  // (son reglas cruzadas), acá solo se valida la forma de cada uno.
  @IsOptional()
  @Transform(toOptionalInt)
  @IsInt()
  companyId?: number | null;

  @IsOptional()
  @Transform(toOptionalInt)
  @IsInt()
  invoiceId?: number | null;

  // Obligatorio en facturas y recibos (validado en el service).
  @IsOptional()
  @Transform(toOptionalInt)
  @IsInt()
  serviceRecordId?: number | null;

  @IsOptional()
  @Transform(toOptionalString)
  @IsDateString()
  documentDate?: string | null;

  @IsOptional()
  @Transform(toOptionalString)
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'statementMonth debe tener el formato YYYY-MM.' })
  statementMonth?: string | null;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  @MaxLength(100)
  documentNumber?: string | null;

  // Obligatorios en facturas y recibos (validado en el service).
  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? null : Number(value)))
  @IsNumber()
  @Min(0)
  amount?: number | null;

  @IsOptional()
  @Transform(toOptionalString)
  @IsIn(DOCUMENT_CURRENCIES)
  currency?: DocumentCurrency | null;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  @MaxLength(255)
  description?: string | null;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  notes?: string | null;
}
