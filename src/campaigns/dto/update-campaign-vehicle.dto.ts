import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCampaignVehicleDto {
  // undefined = no tocar; null = borrar el override y volver al cálculo
  // automático; number = fijarlo.
  @IsOptional()
  @IsNumber()
  @Min(0)
  manualCost?: number | null;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
