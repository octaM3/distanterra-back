import { Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { extname, join } from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const logger = new Logger('ImageOptimizer');

// Formatos rasterizados donde tiene sentido recomprimir y convertir a WebP.
// SVG ya es liviano por naturaleza y GIF se deja intacto para no perder la animación.
const OPTIMIZABLE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const MAX_DIMENSION_PX = 1920;
const WEBP_QUALITY = 82;

/**
 * Redimensiona la imagen (si hace falta) preservando el aspect ratio -sin
 * recortar ni deformar horizontales ni verticales- para que el lado más
 * largo entre en MAX_DIMENSION_PX, y la recomprime como WebP. Después la
 * guarda en UPLOADS_DIR/<subfolder> con un nombre aleatorio y devuelve la
 * ruta relativa para persistir en la base de datos.
 */
export async function optimizeAndSaveImage(
  file: Express.Multer.File,
  subfolder: string,
): Promise<string> {
  const uploadsDir = process.env.UPLOADS_DIR ?? './uploads';
  const targetDir = join(uploadsDir, subfolder);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
    logger.log(`Directorio de uploads creado: ${targetDir}`);
  }

  let buffer = file.buffer;
  let extension = extname(file.originalname).toLowerCase();

  if (OPTIMIZABLE_MIME_TYPES.has(file.mimetype)) {
    const originalSize = buffer.length;
    buffer = await sharp(buffer)
      .rotate() // aplica la orientación EXIF (fotos de celular) antes de redimensionar
      .resize({
        width: MAX_DIMENSION_PX,
        height: MAX_DIMENSION_PX,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    extension = '.webp';
    logger.debug(
      `Imagen optimizada: "${file.originalname}" ${originalSize} bytes → ${buffer.length} bytes (webp)`,
    );
  }

  const filename = `${uuidv4()}${extension}`;
  await writeFile(join(targetDir, filename), buffer);
  logger.debug(`Archivo guardado: "${file.originalname}" → "${filename}" en ${targetDir}`);

  return `${subfolder}/${filename}`;
}
