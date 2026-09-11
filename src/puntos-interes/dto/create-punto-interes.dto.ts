import { Type } from 'class-transformer';
import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  CATEGORIAS_PUNTO_INTERES,
  CategoriaPuntoInteres,
} from '@/database/entities/punto-interes.entity';

export class CreatePuntoInteresDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string | null;

  @IsOptional()
  @IsString()
  comentario?: string | null;

  @IsIn(CATEGORIAS_PUNTO_INTERES)
  categoria: CategoriaPuntoInteres;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  pais?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  provincia?: string | null;

  @Type(() => Number)
  @IsLatitude()
  latitude: number;

  @Type(() => Number)
  @IsLongitude()
  longitude: number;
}
