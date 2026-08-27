import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @MaxLength(20)
  licensePlate: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  // Independientes entre sí: puede tener uno o los dos a la vez. Sin
  // @Type(() => Number) a propósito: viajan en un body JSON (no
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
