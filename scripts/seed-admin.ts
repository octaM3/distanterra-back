/**
 * Crea (o actualiza la contraseña de) la cuenta de administrador,
 * leyendo las credenciales de las variables SEED_ADMIN_USERNAME / SEED_ADMIN_PASSWORD.
 *
 * No existe un endpoint HTTP de registro para administradores: este script
 * es la única forma de crear la cuenta de administrador.
 *
 * Uso:
 *   npm run db:seed-admin
 */
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { Client } from 'pg';

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!username || !password) {
    console.error('[seed-admin] SEED_ADMIN_USERNAME y SEED_ADMIN_PASSWORD deben estar definidos en el archivo .env.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('[seed-admin] SEED_ADMIN_PASSWORD debe tener al menos 8 caracteres.');
    process.exit(1);
  }

  console.log(`[seed-admin] Conectando a la base de datos en ${process.env.DB_HOST}:${process.env.DB_PORT}...`);

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
  console.log('[seed-admin] Conexión establecida.');

  try {
    console.log(`[seed-admin] Generando hash de contraseña para "${username}"...`);
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await client.query(
      `INSERT INTO admins (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username)
       DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = now()
       RETURNING id, username`,
      [username, passwordHash],
    );

    console.log(`[seed-admin] Cuenta lista: ${result.rows[0].username} (id=${result.rows[0].id})`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[seed-admin] Error al crear la cuenta de administrador:', err);
  process.exit(1);
});
