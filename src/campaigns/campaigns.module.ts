import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from '@/database/entities/campaign.entity';
import { CampaignActivityLog } from '@/database/entities/campaign-activity-log.entity';
import { CampaignExpense } from '@/database/entities/campaign-expense.entity';
import { CampaignGuide } from '@/database/entities/campaign-guide.entity';
import { CampaignPackAnimal } from '@/database/entities/campaign-pack-animal.entity';
import { CampaignStockItem } from '@/database/entities/campaign-stock-item.entity';
import { CampaignVehicle } from '@/database/entities/campaign-vehicle.entity';
import { StockItemsModule } from '@/stock-items/stock-items.module';
import { StockCategoriesModule } from '@/stock-categories/stock-categories.module';
import { VehiclesModule } from '@/vehicles/vehicles.module';
import { ServiceRecordsModule } from '@/service-records/service-records.module';
import { CampaignActivityLogsController } from './campaign-activity-logs.controller';
import { CampaignActivityLogsService } from './campaign-activity-logs.service';
import { CampaignExpensesController } from './campaign-expenses.controller';
import { CampaignExpensesService } from './campaign-expenses.service';
import { CampaignExportService } from './campaign-export.service';
import { CampaignGuidesController } from './campaign-guides.controller';
import { CampaignGuidesService } from './campaign-guides.service';
import { CampaignPackAnimalsController } from './campaign-pack-animals.controller';
import { CampaignPackAnimalsService } from './campaign-pack-animals.service';
import { CampaignStockController } from './campaign-stock.controller';
import { CampaignStockService } from './campaign-stock.service';
import { CampaignVehiclesController } from './campaign-vehicles.controller';
import { CampaignVehiclesService } from './campaign-vehicles.service';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Campaign,
      CampaignStockItem,
      CampaignVehicle,
      CampaignGuide,
      CampaignPackAnimal,
      CampaignExpense,
      CampaignActivityLog,
    ]),
    StockItemsModule,
    StockCategoriesModule,
    VehiclesModule,
    ServiceRecordsModule,
  ],
  controllers: [
    CampaignsController,
    CampaignStockController,
    CampaignVehiclesController,
    CampaignGuidesController,
    CampaignPackAnimalsController,
    CampaignExpensesController,
    CampaignActivityLogsController,
  ],
  providers: [
    CampaignsService,
    CampaignStockService,
    CampaignVehiclesService,
    CampaignGuidesService,
    CampaignPackAnimalsService,
    CampaignExpensesService,
    CampaignActivityLogsService,
    CampaignExportService,
  ],
})
export class CampaignsModule {}
