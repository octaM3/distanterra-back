import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '@/config/configuration';
import { Admin } from './entities/admin.entity';
import { Comment } from './entities/comment.entity';
import { ContactMessage } from './entities/contact-message.entity';
import { Experience } from './entities/experience.entity';
import { GalleryImage } from './entities/gallery-image.entity';
import { Image } from './entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        type: 'postgres',
        host: configService.get('db.host', { infer: true }),
        port: configService.get('db.port', { infer: true }),
        username: configService.get('db.username', { infer: true }),
        password: configService.get('db.password', { infer: true }),
        database: configService.get('db.database', { infer: true }),
        ssl: configService.get('db.ssl', { infer: true }) ? { rejectUnauthorized: false } : false,
        entities: [Admin, Comment, Image, Experience, ContactMessage, GalleryImage],
        // El esquema se gestiona manualmente con los archivos de la carpeta sql/, nunca con sincronización automática.
        synchronize: false,
        logging: configService.get('nodeEnv', { infer: true }) === 'development',
      }),
    }),
    TypeOrmModule.forFeature([Admin, Comment, Image, Experience, ContactMessage, GalleryImage]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
