import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaignExpenseDto } from './create-campaign-expense.dto';

export class UpdateCampaignExpenseDto extends PartialType(CreateCampaignExpenseDto) {}
