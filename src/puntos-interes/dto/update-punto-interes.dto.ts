import { PartialType } from '@nestjs/mapped-types';
import { CreatePuntoInteresDto } from './create-punto-interes.dto';

export class UpdatePuntoInteresDto extends PartialType(CreatePuntoInteresDto) {}
