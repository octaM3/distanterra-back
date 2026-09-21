import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CAMPAIGN_KINDS,
  CampaignApprovalStatus,
  CampaignKind,
} from '@/database/entities/campaign.entity';

export class CreateCampaignDto {
  // Por defecto campaña: los servicios sueltos lo mandan explícito.
  @IsOptional()
  @IsIn(CAMPAIGN_KINDS)
  kind?: CampaignKind;

  /**
   * Todo nace como presupuesto: es la única puerta de entrada. Se acepta el
   * campo —el front lo manda explícito— pero con un solo valor posible, para
   * que quede escrito en el contrato y no como una convención tácita.
   *
   * Los otros dos estados son resultado de una acción con consecuencias
   * (aprobar reserva equipamiento y crea el ítem de gestión, rechazar
   * archiva), y para eso están sus endpoints.
   */
  @IsOptional()
  @IsIn(['presupuesto'])
  approvalStatus?: Extract<CampaignApprovalStatus, 'presupuesto'>;

  // IVA del PDF que se le manda a la empresa. No entra en los costos internos.
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  taxPercentage?: number;

  @Type(() => Number)
  @IsInt()
  companyId: number;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
