import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class CreateGalleryImageDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;
}
