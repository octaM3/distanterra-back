import { BadRequestException, Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { unlink, writeFile } from 'fs/promises';
import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const logger = new Logger('FileUpload');

// Tipos MIME permitidos para subida de imágenes.
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

// Tamaño máximo aceptado para el archivo tal como lo sube el cliente (antes de
// cualquier optimización). Configurable vía MAX_UPLOAD_SIZE_BYTES (ver .env.example);
// evita que una subida enorme se cargue entera en memoria.
const MAX_UPLOAD_SIZE_BYTES = parseInt(process.env.MAX_UPLOAD_SIZE_BYTES ?? '6291456', 10);

const imageFileFilter = (
  _req: unknown,
  file: { mimetype: string; originalname: string },
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    logger.warn(
      `Tipo de archivo rechazado: "${file.mimetype}" (archivo: "${file.originalname}")`,
    );
    callback(
      new BadRequestException(
        'Tipo de archivo no permitido. Solo se aceptan imagenes (jpeg, png, webp, gif, svg).',
      ),
      false,
    );
    return;
  }
  callback(null, true);
};

/**
 * Construye las opciones de multer para guardar imágenes en disco local,
 * dentro de UPLOADS_DIR/<subcarpeta>, con un nombre de archivo aleatorio
 * (nunca se usa el nombre original del cliente).
 */
export function buildImageMulterOptions(subfolder: string) {
  const uploadsDir = process.env.UPLOADS_DIR ?? './uploads';
  const targetDir = join(uploadsDir, subfolder);

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
    logger.log(`Directorio de uploads creado: ${targetDir}`);
  }

  return {
    storage: diskStorage({
      destination: targetDir,
      filename: (_req, file, callback) => {
        const safeExt = extname(file.originalname).toLowerCase();
        const generatedName = `${uuidv4()}${safeExt}`;
        logger.debug(
          `Archivo recibido: "${file.originalname}" → guardado como "${generatedName}" en ${targetDir}`,
        );
        callback(null, generatedName);
      },
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  };
}

/**
 * Variante en memoria: no escribe nada a disco por sí sola. Se usa cuando el
 * archivo subido debe procesarse (redimensionar/recomprimir) antes de
 * guardarse — ver optimizeAndSaveImage en image-optimizer.util.ts.
 */
export function buildImageMemoryMulterOptions() {
  return {
    storage: memoryStorage(),
    fileFilter: imageFileFilter,
    limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  };
}

// El mimetype de un .kmz varía mucho según navegador/SO (a veces llega vacío
// o como "application/octet-stream", ya que no todos lo reconocen como zip);
// se filtra por extensión en vez de por mimetype, más confiable acá.
const kmzFileFilter = (
  _req: unknown,
  file: { originalname: string },
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.originalname.toLowerCase().endsWith('.kmz')) {
    logger.warn(`Tipo de archivo rechazado para tracking: "${file.originalname}"`);
    callback(new BadRequestException('Solo se aceptan archivos .kmz.'), false);
    return;
  }
  callback(null, true);
};

const pdfFileFilter = (
  _req: unknown,
  file: { mimetype: string; originalname: string },
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (file.mimetype !== 'application/pdf') {
    logger.warn(`Tipo de archivo rechazado: "${file.mimetype}" (archivo: "${file.originalname}")`);
    callback(new BadRequestException('Solo se aceptan archivos PDF.'), false);
    return;
  }
  callback(null, true);
};

/**
 * En memoria: el PDF se guarda tal cual con saveRawFile (no hay nada que
 * optimizar). Usado para la documentación de empleados (estudios médicos y
 * pólizas de seguro).
 */
export function buildPdfMemoryMulterOptions() {
  return {
    storage: memoryStorage(),
    fileFilter: pdfFileFilter,
    limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  };
}

/** En memoria: el .kmz se parsea (ver kml-parser.util.ts) y se vuelve a guardar aparte. */
export function buildKmzMemoryMulterOptions() {
  return {
    storage: memoryStorage(),
    fileFilter: kmzFileFilter,
    limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  };
}

/**
 * Borra del disco un archivo ya subido, a partir de la ruta relativa que se
 * guardó en la base de datos. Se usa al reemplazar un archivo por otro, para
 * no dejar huérfano el anterior. No falla si el archivo ya no está.
 */
export async function deleteUploadedFile(relativePath: string): Promise<void> {
  const uploadsDir = process.env.UPLOADS_DIR ?? './uploads';
  const fullPath = join(uploadsDir, relativePath);
  try {
    await unlink(fullPath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      logger.warn(`No se pudo eliminar el archivo ${fullPath}: ${(err as Error).message}`);
    }
  }
}

/**
 * Guarda un archivo tal cual (sin procesar, a diferencia de
 * optimizeAndSaveImage) en UPLOADS_DIR/<subfolder> con nombre aleatorio, y
 * devuelve la ruta relativa para persistir en la base de datos. Usado para
 * el .kmz original de un tracking, que se conserva para poder descargarlo
 * aunque ya se hayan extraído sus puntos.
 */
export async function saveRawFile(file: Express.Multer.File, subfolder: string): Promise<string> {
  const uploadsDir = process.env.UPLOADS_DIR ?? './uploads';
  const targetDir = join(uploadsDir, subfolder);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
    logger.log(`Directorio de uploads creado: ${targetDir}`);
  }

  const filename = `${uuidv4()}${extname(file.originalname).toLowerCase()}`;
  await writeFile(join(targetDir, filename), file.buffer);
  logger.debug(`Archivo guardado: "${file.originalname}" → "${filename}" en ${targetDir}`);

  return `${subfolder}/${filename}`;
}
