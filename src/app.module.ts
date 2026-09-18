import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import configuration, { AppConfig } from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { FriendlyThrottlerGuard } from './common/guards/friendly-throttler.guard';
import { PUBLIC_UPLOAD_ROOT } from './common/uploads/upload-targets';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { CompaniesModule } from './companies/companies.module';
import { StockCategoriesModule } from './stock-categories/stock-categories.module';
import { StockItemsModule } from './stock-items/stock-items.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { EmployeesModule } from './employees/employees.module';
import { ServiceRecordsModule } from './service-records/service-records.module';
import { FinancialDocumentsModule } from './financial-documents/financial-documents.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { ImagesModule } from './images/images.module';
import { GalleryModule } from './gallery/gallery.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { PuntosInteresModule } from './puntos-interes/puntos-interes.module';
import { TrackingsModule } from './trackings/trackings.module';
import { FilesModule } from './files/files.module';

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
    // Solo se sirve estáticamente el árbol PÚBLICO de uploads (galería, logos,
    // fotos de testimonios). La documentación interna vive en <UPLOADS_DIR>/private
    // y se entrega únicamente por GET /api/admin/files/* detrás del JwtAuthGuard
    // (ver files/private-files.controller.ts y common/uploads/upload-targets.ts).
    //
    // Las URLs públicas no cambian: lo que antes era /uploads/gallery/x.webp
    // sigue siéndolo, porque el prefijo "public/" se agrega del lado del disco,
    // no de la ruta HTTP.
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => [
        {
          rootPath: join(
            process.cwd(),
            configService.get('uploads.dir', { infer: true }),
            PUBLIC_UPLOAD_ROOT,
          ),
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
    EmployeesModule,
    ServiceRecordsModule,
    FinancialDocumentsModule,
    PuntosInteresModule,
    TrackingsModule,
    FilesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FriendlyThrottlerGuard,
    },
  ],
})
export class AppModule {}
