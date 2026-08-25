import { IsString, MaxLength } from 'class-validator';

export class CreateStockCategoryDto {
  @IsString()
  @MaxLength(100)
  name: string;
}
