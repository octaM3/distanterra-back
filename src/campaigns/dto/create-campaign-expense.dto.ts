import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateCampaignExpenseDto {
  @IsString()
  @MaxLength(255)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  expenseDate: string;
}
