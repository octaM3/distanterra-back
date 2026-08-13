/**
 * Ejecuta todos los archivos .sql de la carpeta sql/ en orden alfabético
 * contra la base de datos configurada en las variables de entorno.
 * Es seguro ejecutarlo más de una vez: todo el DDL usa "CREATE ... IF NOT EXISTS".
 *
 * Uso:
 *   npm run db:init
 */
import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

async function main() {
  const sqlDir = join(__dirname, '..', 'sql');
  const files = readdirSync(sqlDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`[init-db] Conectando a la base de datos en ${process.env.DB_HOST}:${process.env.DB_PORT}...`);

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
  console.log('[init-db] Conexión establecida.');

  try {
    for (const file of files) {
      const sql = readFileSync(join(sqlDir, file), 'utf-8');
      console.log(`[init-db] Ejecutando ${file}...`);
      await client.query(sql);
      console.log(`[init-db] ${file} ejecutado correctamente.`);
    }
    console.log('[init-db] Esquema de base de datos inicializado correctamente.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[init-db] Error al inicializar el esquema de la base de datos:', err);
  process.exit(1);
});
