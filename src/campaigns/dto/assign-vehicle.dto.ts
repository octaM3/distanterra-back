import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AssignVehicleDto {
  @Type(() => Number)
  @IsInt()
  vehicleId: number;

  // Precio total cargado a mano, reemplaza el cálculo automático. Sin
  // @Type(() => Number) a propósito (ver create-stock-item.dto.ts).
  @IsOptional()
  @IsNumber()
  @Min(0)
  manualCost?: number | null;

  // Rango dentro de la campaña en el que se usa el vehículo (puede ser
  // menor a la duración completa de la campaña, o igual a ella si se
  // asigna para "toda la expedición").
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
