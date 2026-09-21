import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCampaignDto } from './create-campaign.dto';

/**
 * `approvalStatus` queda afuera a propósito: aprobar o rechazar un
 * presupuesto no es editar un campo, tiene sus propios endpoints porque
 * arrastra consecuencias (revalidar disponibilidad, crear el ítem de
 * gestión). Ver CampaignsService.approve.
 */
export class UpdateCampaignDto extends PartialType(
  OmitType(CreateCampaignDto, ['approvalStatus'] as const),
) {}
