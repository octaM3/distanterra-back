import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '@/config/configuration';
import { Admin } from './entities/admin.entity';
import { CampaignActivityLog } from './entities/campaign-activity-log.entity';
import { CampaignExpense } from './entities/campaign-expense.entity';
import { CampaignGuide } from './entities/campaign-guide.entity';
import { CampaignPackAnimal } from './entities/campaign-pack-animal.entity';
import { CampaignStockItem } from './entities/campaign-stock-item.entity';
import { CampaignVehicle } from './entities/campaign-vehicle.entity';
import { Campaign } from './entities/campaign.entity';
import { Comment } from './entities/comment.entity';
import { Company } from './entities/company.entity';
import { ContactMessage } from './entities/contact-message.entity';
import { Experience } from './entities/experience.entity';
import { GalleryImage } from './entities/gallery-image.entity';
import { Image } from './entities/image.entity';
import { StockCategory } from './entities/stock-category.entity';
import { StockItem } from './entities/stock-item.entity';
import { Vehicle } from './entities/vehicle.entity';

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
        entities: [
          Admin,
          Comment,
          Image,
          Experience,
          ContactMessage,
          GalleryImage,
          Company,
          StockCategory,
          StockItem,
          Vehicle,
          Campaign,
          CampaignStockItem,
          CampaignVehicle,
          CampaignGuide,
          CampaignPackAnimal,
          CampaignExpense,
          CampaignActivityLog,
        ],
        // El esquema se gestiona manualmente con los archivos de la carpeta sql/, nunca con sincronización automática.
        synchronize: false,
        logging: configService.get('nodeEnv', { infer: true }) === 'development',
      }),
    }),
    TypeOrmModule.forFeature([
      Admin,
      Comment,
      Image,
      Experience,
      ContactMessage,
      GalleryImage,
      Company,
      StockCategory,
      StockItem,
      Vehicle,
      Campaign,
      CampaignStockItem,
      CampaignVehicle,
      CampaignGuide,
      CampaignPackAnimal,
      CampaignExpense,
      CampaignActivityLog,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
