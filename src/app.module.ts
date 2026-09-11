import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import configuration, { AppConfig } from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { FriendlyThrottlerGuard } from './common/guards/friendly-throttler.guard';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { CompaniesModule } from './companies/companies.module';
import { StockCategoriesModule } from './stock-categories/stock-categories.module';
import { StockItemsModule } from './stock-items/stock-items.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { ImagesModule } from './images/images.module';
import { GalleryModule } from './gallery/gallery.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { PuntosInteresModule } from './puntos-interes/puntos-interes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        throttlers: [
          {
            ttl: configService.get('throttle.ttlSeconds', { infer: true }) * 1000,
            limit: configService.get('throttle.limit', { infer: true }),
          },
        ],
      }),
    }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => [
        {
          rootPath: join(process.cwd(), configService.get('uploads.dir', { infer: true })),
          serveRoot: '/uploads',
        },
      ],
    }),
    DatabaseModule,
    AuthModule,
    CommentsModule,
    ImagesModule,
    GalleryModule,
    ExperiencesModule,
    ContactMessagesModule,
    CompaniesModule,
    StockCategoriesModule,
    StockItemsModule,
    VehiclesModule,
    CampaignsModule,
    PuntosInteresModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FriendlyThrottlerGuard,
    },
  ],
})
export class AppModule {}
