/**
 * Mueve los uploads del layout viejo (todo suelto bajo UPLOADS_DIR, servido
 * estáticamente sin excepción) al nuevo, partido en dos árboles:
 *
 *   <UPLOADS_DIR>/public/<subcarpeta>    → sigue servido en /uploads
 *   <UPLOADS_DIR>/private/<subcarpeta>   → solo vía GET /api/admin/files/*
 *
 * La visibilidad de cada subcarpeta la decide common/uploads/upload-targets.ts,
 * que es la misma tabla que usa la aplicación en runtime — no hay una segunda
 * lista que se pueda desincronizar.
 *
 * No toca la base de datos: las rutas relativas guardadas ("gallery/x.webp",
 * "medical-exams/y.pdf") siguen siendo válidas, porque el prefijo public/private
 * se resuelve en runtime.
 *
 * Es idempotente: correrlo dos veces no hace nada la segunda vez.
 *
 * Uso:
 *   npm run uploads:split -- --dry-run   (muestra qué haría, sin tocar nada)
 *   npm run uploads:split
 */
import 'dotenv/config';
import { existsSync, mkdirSync, readdirSync, renameSync, statSync } from 'fs';
import { join } from 'path';
import {
  PRIVATE_UPLOAD_ROOT,
  PUBLIC_UPLOAD_ROOT,
  uploadsBaseDir,
  visibilityOf,
} from '../src/common/uploads/upload-targets';

const dryRun = process.argv.includes('--dry-run');

/**
 * Mueve el contenido de origen a destino. Si el destino ya existe (por ejemplo
 * porque una corrida anterior quedó a medias), mueve archivo por archivo en vez
 * de fallar.
 */
function moveInto(sourceDir: string, targetDir: string): number {
  if (!existsSync(targetDir)) {
    const entryCount = readdirSync(sourceDir).length;
    if (!dryRun) {
      mkdirSync(join(targetDir, '..'), { recursive: true });
      renameSync(sourceDir, targetDir);
    }
    return entryCount;
  }

  let moved = 0;
  for (const entry of readdirSync(sourceDir)) {
    const from = join(sourceDir, entry);
    const to = join(targetDir, entry);
    if (existsSync(to)) {
      console.warn(`[uploads:split]   ! ya existe en destino, se deja como está: ${to}`);
      continue;
    }
    if (!dryRun) renameSync(from, to);
    moved++;
  }
  return moved;
}

function main() {
  const baseDir = uploadsBaseDir();

  if (!existsSync(baseDir)) {
    console.log(`[uploads:split] No existe ${baseDir}, no hay nada que migrar.`);
    return;
  }

  console.log(`[uploads:split] Raíz de uploads: ${baseDir}${dryRun ? ' (simulación)' : ''}`);

  const reservedRoots = new Set([PUBLIC_UPLOAD_ROOT, PRIVATE_UPLOAD_ROOT]);
  const subfolders = readdirSync(baseDir).filter((entry) => {
    if (reservedRoots.has(entry)) return false;
    return statSync(join(baseDir, entry)).isDirectory();
  });

  if (subfolders.length === 0) {
    console.log('[uploads:split] No quedan subcarpetas en el layout viejo. Nada que hacer.');
    return;
  }

  for (const subfolder of subfolders) {
    const visibility = visibilityOf(subfolder);
    const sourceDir = join(baseDir, subfolder);
    const targetDir = join(baseDir, visibility, subfolder);

    const moved = moveInto(sourceDir, targetDir);
    console.log(`[uploads:split] ${subfolder} → ${visibility}/${subfolder} (${moved} entrada(s))`);
  }

  // Los archivos sueltos en la raíz (si los hubiera) no se tocan: no tienen
  // subcarpeta que determine su visibilidad, así que se reportan para revisar
  // a mano en vez de adivinar.
  const looseFiles = readdirSync(baseDir).filter(
    (entry) => !reservedRoots.has(entry) && statSync(join(baseDir, entry)).isFile(),
  );
  if (looseFiles.length > 0) {
    console.warn(
      `[uploads:split] Atención: ${looseFiles.length} archivo(s) suelto(s) en la raíz sin subcarpeta, revisar a mano: ${looseFiles.join(', ')}`,
    );
  }

  console.log(`[uploads:split] Listo.${dryRun ? ' (no se movió nada, era una simulación)' : ''}`);
}

main();
