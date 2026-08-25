import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { StockPricingType } from '@/database/entities/stock-item.entity';

export class UpdateCampaignStockItemDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsIn(['per_day', 'per_month', 'none'])
  pricingType?: StockPricingType;

  @IsOptional()
  @IsString()
  notes?: string;
}
