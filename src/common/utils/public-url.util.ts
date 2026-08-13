/**
 * Construye la URL pública de un archivo guardado en UPLOADS_DIR
 * y servido estáticamente en "/uploads/*".
 */
export function toPublicFileUrl(apiUrl: string, relativePath: string | null): string | null {
  if (!relativePath) return null;
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${apiUrl.replace(/\/+$/, '')}/uploads/${normalized}`;
}
