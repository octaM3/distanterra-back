import { IsDateString } from 'class-validator';

export class ExtendCampaignDto {
  @IsDateString()
  newEndDate: string;
}
