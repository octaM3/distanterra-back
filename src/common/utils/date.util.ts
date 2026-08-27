const BUSINESS_TIMEZONE = 'America/Argentina/Mendoza';

/**
 * Formatea un instante como fecha "YYYY-MM-DD" según el calendario de
 * Mendoza (la sede del negocio), no UTC. Usar `date.toISOString().slice(0,
 * 10)` está mal acá: Mendoza es UTC-3, así que entre las 21:00 y las 23:59
 * hora local, en UTC ya es el día siguiente — cualquier fecha derivada de un
 * instante (¿es hoy?, ¿en qué día se finalizó la campaña?) se adelanta un
 * día durante esa ventana si se calcula en UTC.
 */
export function toLocalDateString(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIMEZONE }).format(date);
}

/** Fecha "YYYY-MM-DD" de hoy según el calendario de Mendoza (ver toLocalDateString). */
export function todayLocalDateString(): string {
  return toLocalDateString(new Date());
}
