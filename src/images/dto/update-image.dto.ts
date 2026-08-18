import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateImageDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;
}
