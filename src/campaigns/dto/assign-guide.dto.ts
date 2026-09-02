import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AssignGuideDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  // Precio por baqueano por día, cargado directamente en el formulario (no
  // hay catálogo/configuración global, ver campaign-guide.entity.ts). Costo
  // = quantity * pricePerDay * cantidad_de_días * (1 + taxPercentage/100),
  // salvo manualCost (ver computeGuideCost).
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerDay?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number | null;

  // Precio total cargado a mano, reemplaza el cálculo automático. Sin
  // @Type(() => Number) a propósito: viaja en un body JSON, y así "null"
  // explícito no se corrompe en 0 al pasar por el constructor Number().
  @IsOptional()
  @IsNumber()
  @Min(0)
  manualCost?: number | null;

  // Rango dentro de la campaña en el que se contrata a los baqueanos
  // (puede ser menor a la duración completa, o igual a ella si se elige
  // "toda la expedición"); determina la cantidad de días que se cobra (ver
  // computeGuideCost).
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
