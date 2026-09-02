import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class AssignPackAnimalDto {
  // Tipo de animal (ej. "Caballo", "Burro", "Mula"), texto libre cargado
  // directamente en el formulario — no hay catálogo (ABM) de animales.
  @IsString()
  @MaxLength(100)
  animalType: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  // Precio por día y % de impuestos cargados directamente en el
  // formulario. Costo = quantity * pricePerDay * cantidad_de_días *
  // (1 + taxPercentage/100), salvo manualCost (ver computeGuideCost).
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

  // Rango dentro de la campaña en el que se contrata (puede ser menor a la
  // duración completa de la campaña).
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
