export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiUrl: string;
  corsOrigins: string[];
  adminLoginPath: string;
  jwt: {
    secret: string;
    expiresIn: string;
    cookieName: string;
  };
  db: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: boolean;
  };
  uploads: {
    dir: string;
    maxSizeBytes: number;
  };
  loginThrottle: {
    ttlSeconds: number;
    limit: number;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  apiUrl: process.env.API_URL ?? 'http://localhost:3001',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  adminLoginPath: process.env.ADMIN_LOGIN_PATH ?? '/gestion-x9k2/acceso',
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    cookieName: process.env.JWT_COOKIE_NAME ?? 'distanterra_admin_session',
  },
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'distanterra',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'distanterra_db',
    ssl: (process.env.DB_SSL ?? 'false').toLowerCase() === 'true',
  },
  uploads: {
    dir: process.env.UPLOADS_DIR ?? './uploads',
    maxSizeBytes: parseInt(process.env.MAX_UPLOAD_SIZE_BYTES ?? '5242880', 10),
  },
  loginThrottle: {
    ttlSeconds: parseInt(process.env.LOGIN_THROTTLE_TTL_SECONDS ?? '60', 10),
    limit: parseInt(process.env.LOGIN_THROTTLE_LIMIT ?? '5', 10),
  },
});
