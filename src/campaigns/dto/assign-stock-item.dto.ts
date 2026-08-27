import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AssignStockItemDto {
  @Type(() => Number)
  @IsInt()
  stockItemId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  // Override explícito para no cobrar este ítem, aunque tenga precio
  // cargado en el catálogo. El costo normal se calcula automáticamente
  // combinando el precio por día y por mes del catálogo (ver
  // computeStockItemCost).
  @IsOptional()
  @IsBoolean()
  noCost?: boolean;

  // Precio total cargado a mano, reemplaza el cálculo automático. Sin
  // @Type(() => Number) a propósito (ver create-stock-item.dto.ts).
  @IsOptional()
  @IsNumber()
  @Min(0)
  manualCost?: number | null;

  // Rango dentro de la campaña en el que se alquila este ítem (puede ser
  // menor a la duración completa de la campaña); determina el costo real.
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
