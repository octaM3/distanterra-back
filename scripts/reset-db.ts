/**
 * Borra TODAS las tablas del esquema (y su contenido) y vuelve a crear el
 * esquema completo desde cero, corriendo sql/*.sql en orden como db:init.
 *
 * Destructivo: pide confirmación explícita con --yes, si no solo explica
 * qué haría y no toca nada.
 *
 * Uso:
 *   npm run db:reset -- --yes
 */
import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

async function main() {
  const dbName = process.env.DB_NAME;
  const confirmed = process.argv.includes('--yes') || process.argv.includes('-y');

  console.log(
    `[reset-db] Esto va a BORRAR todas las tablas y datos de la base "${dbName}" en ${process.env.DB_HOST}:${process.env.DB_PORT} y recrear el esquema desde cero.`,
  );

  if (!confirmed) {
    console.log('[reset-db] Nada se tocó. Volvé a correrlo con --yes para confirmar:');
    console.log('[reset-db]   npm run db:reset -- --yes');
    return;
  }

  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: dbName,
    ssl:
      (process.env.DB_SSL ?? 'false').toLowerCase() === 'true'
        ? { rejectUnauthorized: false }
        : false,
  });

  await client.connect();
  console.log('[reset-db] Conexión establecida.');

  try {
    console.log(
      '[reset-db] Eliminando el esquema "public" (todas las tablas, índices, constraints)...',
    );
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    // Restaura los privilegios por defecto del esquema (DROP SCHEMA los borra).
    await client.query(
      `GRANT ALL ON SCHEMA public TO CURRENT_USER; GRANT ALL ON SCHEMA public TO public;`,
    );
    console.log('[reset-db] Esquema recreado vacío.');

    const sqlDir = join(__dirname, '..', 'sql');
    const files = readdirSync(sqlDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const sql = readFileSync(join(sqlDir, file), 'utf-8');
      console.log(`[reset-db] Ejecutando ${file}...`);
      await client.query(sql);
    }

    console.log('[reset-db] Base de datos reseteada y esquema inicializado desde cero.');
    console.log(
      '[reset-db] Recordá correr "npm run db:seed-admin" para crear la cuenta de administrador.',
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[reset-db] Error al resetear la base de datos:', err);
  process.exit(1);
});
