import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTrackingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string | null;
}
