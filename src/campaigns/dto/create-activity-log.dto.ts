import { IsDateString, IsString } from 'class-validator';

export class CreateActivityLogDto {
  @IsDateString()
  logDate: string;

  @IsString()
  description: string;
}
