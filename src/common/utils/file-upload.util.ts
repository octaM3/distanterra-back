import { BadRequestException, Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
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
// cualquier optimización). Suficiente para una foto sin comprimir de una
// cámara o celular; evita que una subida enorme se cargue entera en memoria.
const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024;

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
