import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateImageDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altTextEs?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  altTextEn?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;
}
