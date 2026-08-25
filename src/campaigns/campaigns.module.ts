import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from '@/database/entities/campaign.entity';
import { CampaignActivityLog } from '@/database/entities/campaign-activity-log.entity';
import { CampaignExpense } from '@/database/entities/campaign-expense.entity';
import { CampaignStockItem } from '@/database/entities/campaign-stock-item.entity';
import { StockItemsModule } from '@/stock-items/stock-items.module';
import { CampaignActivityLogsController } from './campaign-activity-logs.controller';
import { CampaignActivityLogsService } from './campaign-activity-logs.service';
import { CampaignExpensesController } from './campaign-expenses.controller';
import { CampaignExpensesService } from './campaign-expenses.service';
import { CampaignExportService } from './campaign-export.service';
import { CampaignStockController } from './campaign-stock.controller';
import { CampaignStockService } from './campaign-stock.service';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, CampaignStockItem, CampaignExpense, CampaignActivityLog]),
    StockItemsModule,
  ],
  controllers: [
    CampaignsController,
    CampaignStockController,
    CampaignExpensesController,
    CampaignActivityLogsController,
  ],
  providers: [
    CampaignsService,
    CampaignStockService,
    CampaignExpensesService,
    CampaignActivityLogsService,
    CampaignExportService,
  ],
})
export class CampaignsModule {}
