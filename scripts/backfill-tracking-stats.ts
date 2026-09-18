/**
 * Recalcula las métricas y los datos del archivo de los trackings que ya
 * estaban cargados antes de que existieran esas columnas.
 *
 * Es posible porque el .kmz original se conserva siempre: se lee de disco, se
 * vuelve a parsear y se guardan "stats" y "device_info". Los puntos del
 * recorrido no se tocan, ya estaban bien.
 *
 * Es idempotente y por defecto solo procesa los que no tienen métricas.
 *
 * Uso:
 *   npm run trackings:backfill-stats -- --dry-run   (muestra qué haría)
 *   npm run trackings:backfill-stats
 *   npm run trackings:backfill-stats -- --all       (recalcula también los que ya tienen)
 */
import 'dotenv/config';
import { existsSync, readFileSync } from 'fs';
import { Client } from 'pg';
import { resolveUploadPath } from '../src/common/uploads/upload-targets';
import { parseKmzTrack } from '../src/common/utils/kml-parser.util';

const dryRun = process.argv.includes('--dry-run');
const recalculateAll = process.argv.includes('--all');

async function main() {
  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:
      (process.env.DB_SSL ?? 'false').toLowerCase() === 'true'
        ? { rejectUnauthorized: false }
        : false,
  });

  await client.connect();
  console.log(`[backfill-stats] Conectado a ${process.env.DB_HOST}:${process.env.DB_PORT}`);

  try {
    const { rows } = await client.query<{ id: number; nombre: string; file_path: string }>(
      `SELECT id, nombre, file_path
         FROM trackings
        ${recalculateAll ? '' : 'WHERE stats IS NULL'}
        ORDER BY id`,
    );

    if (rows.length === 0) {
      console.log('[backfill-stats] No hay trackings para procesar.');
      return;
    }

    console.log(
      `[backfill-stats] ${rows.length} tracking(s) para procesar${dryRun ? ' (simulación)' : ''}.`,
    );

    let ok = 0;
    let failed = 0;

    for (const row of rows) {
      const fullPath = resolveUploadPath(row.file_path);
      if (!existsSync(fullPath)) {
        console.warn(`[backfill-stats]   ! id=${row.id} "${row.nombre}": falta el archivo en disco`);
        failed++;
        continue;
      }

      try {
        const { stats, deviceInfo } = parseKmzTrack(readFileSync(fullPath));
        const km = (stats.distanceMeters / 1000).toFixed(1);
        const minutes = stats.durationSeconds ? Math.round(stats.durationSeconds / 60) : null;
        console.log(
          `[backfill-stats]   id=${row.id} "${row.nombre}": ${km} km` +
            (minutes !== null ? `, ${minutes} min` : ', sin marcas de tiempo') +
            (deviceInfo ? ', con datos del archivo' : ''),
        );

        if (!dryRun) {
          await client.query('UPDATE trackings SET stats = $1, device_info = $2 WHERE id = $3', [
            JSON.stringify(stats),
            deviceInfo,
            row.id,
          ]);
        }
        ok++;
      } catch (err) {
        console.warn(
          `[backfill-stats]   ! id=${row.id} "${row.nombre}": ${(err as Error).message}`,
        );
        failed++;
      }
    }

    console.log(
      `[backfill-stats] Listo: ${ok} procesado(s), ${failed} con problemas.` +
        (dryRun ? ' (no se guardó nada, era una simulación)' : ''),
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[backfill-stats] Error:', err);
  process.exit(1);
});
