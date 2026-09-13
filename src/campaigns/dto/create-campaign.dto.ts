import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { CAMPAIGN_KINDS, CampaignKind } from '@/database/entities/campaign.entity';

export class CreateCampaignDto {
  // Por defecto campaña: los servicios sueltos lo mandan explícito.
  @IsOptional()
  @IsIn(CAMPAIGN_KINDS)
  kind?: CampaignKind;

  @Type(() => Number)
  @IsInt()
  companyId: number;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
