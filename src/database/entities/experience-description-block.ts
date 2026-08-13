/**
 * Un bloque individual de la descripción dinámica de una experiencia.
 * Permite mezclar párrafos de texto libre con listas de ítems, en cualquier
 * orden y cantidad, para que el administrador pueda construir contenido del
 * estilo: texto → lista → texto → lista → texto ...
 */
export type ExperienceDescriptionBlock =
  | { type: 'text'; content: string }
  | { type: 'list'; items: string[] };
