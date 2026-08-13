// Debe ejecutarse antes que cualquier otro import: AuthController lee ADMIN_LOGIN_PATH
// de process.env al momento de carga del módulo (ver auth.controller.ts), lo que
// ocurre antes de que @nestjs/config pudiera haber cargado el archivo .env.
import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AppConfig, true>);

  const env = configService.get('nodeEnv', { infer: true });
  const port = configService.get('port', { infer: true });
  const corsOrigins = configService.get('corsOrigins', { infer: true });

  logger.log(`Entorno: ${env}`);
  logger.log(`Orígenes CORS permitidos: ${corsOrigins.join(', ')}`);

  app.use(helmet());
  logger.log('Middleware Helmet activado');

  app.use(cookieParser());
  logger.log('Middleware CookieParser activado');

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  logger.log('ValidationPipe global activado (whitelist + transform + forbidNonWhitelisted)');

  app.setGlobalPrefix('api');
  logger.log('Prefijo global de rutas: /api');

  await app.listen(port);
  logger.log(`API de Distanterra escuchando en el puerto ${port}`);
}

bootstrap();
