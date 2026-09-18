import { join, normalize, resolve, sep } from 'path';

/**
 * Registro central de subcarpetas de uploads y su visibilidad. Es la única
 * fuente de verdad sobre qué archivos se sirven estáticamente (cualquiera con
 * el enlace los ve, sin sesión) y cuáles solo se entregan a través del endpoint
 * autenticado GET /api/admin/files/*.
 *
 * En disco, UPLOADS_DIR se parte en dos árboles:
 *
 *   <UPLOADS_DIR>/public/<subcarpeta>/...   → servido por ServeStaticModule en /uploads
 *   <UPLOADS_DIR>/private/<subcarpeta>/...  → nunca servido estáticamente
 *
 * Las rutas relativas guardadas en la base de datos NO incluyen ese prefijo
 * (siguen siendo "gallery/xxx.webp", "medical-exams/yyy.pdf"): el prefijo se
 * resuelve acá, en tiempo de ejecución, a partir de esta tabla. Por eso el
 * split no requiere tocar ninguna fila existente — solo mover archivos en
 * disco una vez (ver scripts/migrate-uploads-split.ts).
 */

export type UploadVisibility = 'public' | 'private';

/** Nombre de los dos árboles dentro de UPLOADS_DIR. */
export const PUBLIC_UPLOAD_ROOT = 'public';
export const PRIVATE_UPLOAD_ROOT = 'private';

/** Ruta (relativa al prefijo global /api) del endpoint que sirve archivos privados. */
export const PRIVATE_FILES_ROUTE = 'admin/files';

/**
 * Subcarpetas cuyo contenido es público por diseño. El corte es el mismo que
 * ya hace el menú del panel (ver managementNavItems / contentNavItems en
 * AdminLayout.tsx del frontend): lo que cuelga de "Contenido del sitio"
 * alimenta la landing y es público; todo lo que cuelga de "Gestión" es interno
 * y va al árbol privado.
 *
 *   Contenido del sitio → comments (testimonios), logos (partners), gallery
 *   Gestión             → employees, medical-exams, insurance-policies,
 *                         invoices, documents/*, trackings
 *
 * El default es cerrado a propósito: si mañana alguien agrega una subcarpeta
 * nueva y se olvida de este archivo, queda protegida en vez de quedar expuesta.
 * Es la diferencia entre una lista de excepciones que se pudre con el tiempo y
 * una que falla del lado seguro.
 */
const PUBLIC_SUBFOLDERS = new Set(['comments', 'gallery', 'logos']);

/**
 * Subcarpetas privadas que existen hoy. No se usa para autorizar nada (eso lo
 * decide visibilityOf, que asume privado por default) — está solo para que el
 * script de migración sepa qué mover del layout viejo al nuevo.
 */
export const KNOWN_PRIVATE_SUBFOLDERS = [
  'employees',
  'medical-exams',
  'insurance-policies',
  'invoices',
  'trackings',
  'documents',
] as const;

/** Subcarpetas públicas que existen hoy. Mismo uso que la constante anterior. */
export const KNOWN_PUBLIC_SUBFOLDERS = [...PUBLIC_SUBFOLDERS] as const;

/** Raíz de uploads configurada por entorno (UPLOADS_DIR). */
export function uploadsBaseDir(): string {
  return process.env.UPLOADS_DIR ?? './uploads';
}

/**
 * Normaliza una ruta relativa tal como se guarda en la base: separadores en
 * "/", sin barras iniciales. No valida nada — para eso está assertSafeRelativePath.
 */
export function normalizeRelativePath(relativePath: string): string {
  return relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
}

/**
 * Decide la visibilidad a partir del primer segmento de la ruta. Se mira solo
 * el primero (y no la carpeta contenedora completa) para que una subcarpeta
 * anidada herede siempre la visibilidad de su raíz: "documents/facturas/x.pdf"
 * es privado porque "documents" lo es, sin necesidad de enumerar cada nivel.
 */
export function visibilityOf(relativePathOrSubfolder: string): UploadVisibility {
  const [topSegment] = normalizeRelativePath(relativePathOrSubfolder).split('/');
  return PUBLIC_SUBFOLDERS.has(topSegment) ? 'public' : 'private';
}

/** Raíz física del árbol público o privado, según corresponda. */
export function uploadRootFor(visibility: UploadVisibility): string {
  return join(uploadsBaseDir(), visibility === 'public' ? PUBLIC_UPLOAD_ROOT : PRIVATE_UPLOAD_ROOT);
}

/**
 * Directorio físico donde guardar los archivos de una subcarpeta lógica.
 * Ej.: "gallery" → "<UPLOADS_DIR>/public/gallery"
 *      "medical-exams" → "<UPLOADS_DIR>/private/medical-exams"
 */
export function resolveUploadDir(subfolder: string): string {
  return join(uploadRootFor(visibilityOf(subfolder)), normalizeRelativePath(subfolder));
}

/**
 * Ruta física completa de un archivo a partir de la ruta relativa guardada en
 * la base de datos.
 */
export function resolveUploadPath(relativePath: string): string {
  const normalized = normalizeRelativePath(relativePath);
  return join(uploadRootFor(visibilityOf(normalized)), normalized);
}

/** Segmentos aceptados en una ruta de archivo pedida por HTTP. */
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

/**
 * Valida una ruta relativa que viene de la red antes de tocar el disco.
 * Rechaza traversal ("..") y cualquier caracter fuera del juego que generan
 * saveRawFile/optimizeAndSaveImage (uuid + extensión) y los nombres de
 * subcarpeta de este archivo. Devuelve la ruta normalizada.
 */
export function assertSafeRelativePath(relativePath: string): string {
  const normalized = normalizeRelativePath(relativePath);
  if (!normalized) return '';

  const segments = normalized.split('/');
  const isSafe = segments.every(
    (segment) => segment !== '.' && segment !== '..' && SAFE_SEGMENT.test(segment),
  );

  return isSafe ? normalized : '';
}

/**
 * Última línea de defensa contra path traversal: confirma que la ruta física
 * resuelta cae realmente dentro de la raíz esperada. Las validaciones de
 * arriba deberían alcanzar, pero esta comprobación no depende de que el regex
 * esté bien escrito.
 */
export function isInsideRoot(fullPath: string, visibility: UploadVisibility): boolean {
  const root = resolve(uploadRootFor(visibility));
  const target = resolve(normalize(fullPath));
  return target === root || target.startsWith(root + sep);
}
