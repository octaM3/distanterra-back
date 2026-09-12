import { PartialType } from '@nestjs/mapped-types';
import { CreateTrackingDto } from './create-tracking.dto';

// Solo nombre/descripción son editables: para cambiar la línea en sí hay
// que eliminar el tracking y volver a subir el .kmz correcto.
export class UpdateTrackingDto extends PartialType(CreateTrackingDto) {}
