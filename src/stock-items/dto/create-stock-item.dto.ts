import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateStockItemDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @Type(() => Number)
  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalQuantity: number;

  // Independientes entre sí: puede tener uno, el otro, o los dos a la vez.
  // Sin @Type(() => Number) a propósito: viajan en un body JSON (no
  // query/multipart), y así "null" explícito (para borrar un precio ya
  // cargado) no se corrompe en 0 al pasar por el constructor Number().
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerDay?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerMonth?: number | null;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
