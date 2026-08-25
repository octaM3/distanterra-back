import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockCategory } from '@/database/entities/stock-category.entity';
import { StockCategoriesController } from './stock-categories.controller';
import { StockCategoriesService } from './stock-categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockCategory])],
  controllers: [StockCategoriesController],
  providers: [StockCategoriesService],
  exports: [StockCategoriesService],
})
export class StockCategoriesModule {}
