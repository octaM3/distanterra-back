import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

// Hexadecimal de 6 dígitos con numeral: el mismo formato que emite un
// <input type="color"> y que acepta Leaflet sin conversión.
export const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export class CreateTrackingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string | null;

  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: 'color debe ser un hexadecimal de 6 dígitos, por ejemplo "#2563eb".',
  })
  color?: string | null;
}
