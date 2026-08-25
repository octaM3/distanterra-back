import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockCategory } from '@/database/entities/stock-category.entity';
import { StockItem } from '@/database/entities/stock-item.entity';
import { StockItemsController } from './stock-items.controller';
import { StockItemsService } from './stock-items.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockItem, StockCategory])],
  controllers: [StockItemsController],
  providers: [StockItemsService],
  exports: [StockItemsService],
})
export class StockItemsModule {}
