import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsString()
  @MaxLength(150)
  company: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  message?: string;

  // Honeypot anti-bots: campo invisible para personas, que el frontend nunca
  // completa. Si llega con contenido, quien envió el formulario es un bot
  // (los humanos no lo ven ni lo pueden tocar).
  @IsOptional()
  @IsString()
  website?: string;
}
