import {
  PRIVATE_FILES_ROUTE,
  normalizeRelativePath,
  visibilityOf,
} from '@/common/uploads/upload-targets';

/**
 * Construye la URL con la que el frontend accede a un archivo subido, a partir
 * de la ruta relativa guardada en la base de datos.
 *
 * Según la visibilidad de la subcarpeta (ver upload-targets.ts) devuelve una de
 * dos formas:
 *
 *   público  → {API_URL}/uploads/<ruta>              (estático, sin sesión)
 *   privado  → {API_URL}/api/admin/files/<ruta>      (requiere JWT de admin)
 *
 * El frontend no necesita saber cuál es cuál: en ambos casos recibe una URL que
 * puede poner en un <img> o en un <a>, y el navegador manda la cookie de sesión
 * sola cuando hace falta.
 */
export function toFileUrl(apiUrl: string, relativePath: string | null): string | null {
  if (!relativePath) return null;

  const normalized = normalizeRelativePath(relativePath);
  const base = apiUrl.replace(/\/+$/, '');

  return visibilityOf(normalized) === 'public'
    ? `${base}/uploads/${normalized}`
    : `${base}/api/${PRIVATE_FILES_ROUTE}/${normalized}`;
}
