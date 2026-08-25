import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { StockPricingType } from '@/database/entities/stock-item.entity';

export class AssignStockItemDto {
  @Type(() => Number)
  @IsInt()
  stockItemId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  // El ítem de stock puede tener precio por día, por mes, o ambos a la vez:
  // acá se elige qué modalidad de cobro aplica para esta campaña puntual.
  @IsIn(['per_day', 'per_month', 'none'])
  pricingType: StockPricingType;

  @IsOptional()
  @IsString()
  notes?: string;
}
