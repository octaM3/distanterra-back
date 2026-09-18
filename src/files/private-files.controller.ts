import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { extname } from 'path';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import {
  PRIVATE_FILES_ROUTE,
  assertSafeRelativePath,
  isInsideRoot,
  resolveUploadPath,
  visibilityOf,
} from '@/common/uploads/upload-targets';

/**
 * Content-Type por extensión. Se resuelve con una tabla propia en vez de sumar
 * una dependencia tipo "mime-types": las extensiones que pueden llegar acá son
 * solo las que aceptan los fileFilter de subida (PDF, imágenes, KMZ).
 */
const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.kmz': 'application/vnd.google-earth.kmz',
};

/**
 * Extensiones que el navegador puede mostrar embebidas sin riesgo. Un SVG se
 * fuerza a descarga aunque sea una imagen: al renderizarse inline puede
 * ejecutar scripts en el origen de la API, así que no se sirve como página.
 */
const INLINE_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif']);

/**
 * Entrega los archivos del árbol privado de uploads (documentación de
 * empleados, facturas, documentos financieros, KMZ de trackings) solo a un
 * admin con sesión válida.
 *
 * Contrapartida del ServeStaticModule de app.module.ts, que sirve únicamente
 * el árbol público: todo lo que cuelga del grupo "Gestión" del panel pasa por
 * acá y por el JwtAuthGuard, en vez de quedar accesible para cualquiera que
 * tenga el enlace.
 */
@UseGuards(JwtAuthGuard)
// Sin rate limit: una sola pantalla del panel puede pedir decenas de archivos a
// la vez (las fotos de factura de una campaña con muchos gastos), lo que
// chocaría contra el límite global de THROTTLE_LIMIT. El control de acceso acá
// es el JWT, no el throttler.
@SkipThrottle()
@Controller(PRIVATE_FILES_ROUTE)
export class PrivateFilesController {
  private readonly logger = new Logger(PrivateFilesController.name);

  @Get('*path')
  async download(
    @Param('path') pathParam: string | string[],
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    // Express 5 entrega los comodines con nombre como array de segmentos.
    const requestedPath = Array.isArray(pathParam) ? pathParam.join('/') : (pathParam ?? '');

    const relativePath = assertSafeRelativePath(requestedPath);
    if (!relativePath) {
      this.logger.warn(`Ruta de archivo rechazada: "${requestedPath}"`);
      throw new NotFoundException('Archivo no encontrado');
    }

    // Un archivo público no se sirve por acá: tiene su propia URL estática, y
    // aceptarlo duplicaría rutas para el mismo contenido.
    if (visibilityOf(relativePath) !== 'private') {
      throw new NotFoundException('Archivo no encontrado');
    }

    const fullPath = resolveUploadPath(relativePath);
    if (!isInsideRoot(fullPath, 'private')) {
      this.logger.error(`Intento de acceso fuera de la raíz privada: "${requestedPath}"`);
      throw new NotFoundException('Archivo no encontrado');
    }

    const stats = await stat(fullPath).catch(() => null);
    if (!stats?.isFile()) {
      throw new NotFoundException('Archivo no encontrado');
    }

    const extension = extname(relativePath).toLowerCase();
    const contentType = CONTENT_TYPE_BY_EXTENSION[extension] ?? 'application/octet-stream';
    const disposition = INLINE_EXTENSIONS.has(extension) ? 'inline' : 'attachment';

    this.logger.debug(`GET /api/${PRIVATE_FILES_ROUTE}/${relativePath}`);

    res.set({
      'Content-Type': contentType,
      'Content-Length': String(stats.size),
      'Content-Disposition': `${disposition}; filename="${extname(relativePath) ? relativePath.split('/').pop() : 'archivo'}"`,
      // Documentación sensible: que no quede en cachés intermedias ni en la
      // del navegador después de cerrar sesión.
      'Cache-Control': 'private, no-store, max-age=0',
    });

    return new StreamableFile(createReadStream(fullPath));
  }
}
