import { PartialType } from '@nestjs/mapped-types';
import { CreateTrackingDto } from './create-tracking.dto';

// Nombre, descripción y color son editables. Para cambiar la línea en sí hay
// que eliminar el tracking y volver a subir el .kmz correcto.
export class UpdateTrackingDto extends PartialType(CreateTrackingDto) {}
