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

export class UpdateCampaignPackAnimalDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  animalType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerDay?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number | null;

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
