import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  API_URL: Joi.string().uri().default('http://localhost:3001'),
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
  ADMIN_LOGIN_PATH: Joi.string().default('/gestion-x9k2/acceso'),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_COOKIE_NAME: Joi.string().default('distanterra_admin_session'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NAME: Joi.string().required(),
  DB_SSL: Joi.string().valid('true', 'false').default('false'),
  UPLOADS_DIR: Joi.string().default('./uploads'),
  MAX_UPLOAD_SIZE_BYTES: Joi.number().default(5242880),
  LOGIN_THROTTLE_TTL_SECONDS: Joi.number().default(60),
  LOGIN_THROTTLE_LIMIT: Joi.number().default(5),
  SEED_ADMIN_USERNAME: Joi.string().optional(),
  SEED_ADMIN_PASSWORD: Joi.string().optional(),
});
