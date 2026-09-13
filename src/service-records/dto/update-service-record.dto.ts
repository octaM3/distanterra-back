import { IsOptional, IsString, Matches } from 'class-validator';

/**
 * Los ítems de gestión no se crean ni se borran a mano: nacen y mueren con su
 * campaña o servicio. Lo único que se edita acá es el mes al que se imputan y
 * las notas; la empresa, la campaña y la descripción salen de la campaña.
 */
export class UpdateServiceRecordDto {
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'serviceMonth debe tener el formato YYYY-MM.',
  })
  serviceMonth?: string;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
