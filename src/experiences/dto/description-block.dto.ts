import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

/**
 * Un bloque individual de la descripción dinámica de una experiencia. Espeja
 * ExperienceDescriptionBlock en la entidad del backend:
 *  - { type: 'text', content: string }   → párrafo de texto libre
 *  - { type: 'list', items: string[] }   → lista de ítems
 * Permite al administrador construir descripciones con estructura "texto → lista → texto"
 * en cualquier orden y cantidad.
 */
export class DescriptionBlockDto {
  @IsIn(['text', 'list'])
  type: 'text' | 'list';

  @ValidateIf((block: DescriptionBlockDto) => block.type === 'text')
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ValidateIf((block: DescriptionBlockDto) => block.type === 'list')
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Type(() => String)
  items?: string[];
}
