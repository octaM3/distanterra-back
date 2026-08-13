import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { DescriptionBlockDto } from './description-block.dto';

export class CreateExperienceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleEs: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleEn: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  locationEs?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  locationEn?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DescriptionBlockDto)
  descriptionEs: DescriptionBlockDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DescriptionBlockDto)
  descriptionEn: DescriptionBlockDto[];

  /** Nombres de los jefes / responsables del proyecto. Opcional, de cero a muchos. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  bosses?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
