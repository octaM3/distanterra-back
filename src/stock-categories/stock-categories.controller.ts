import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { StockCategory } from '@/database/entities/stock-category.entity';
import { CreateStockCategoryDto } from './dto/create-stock-category.dto';
import { UpdateStockCategoryDto } from './dto/update-stock-category.dto';
import { StockCategoriesService } from './stock-categories.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/stock-categories')
export class StockCategoriesController {
  private readonly logger = new Logger(StockCategoriesController.name);

  constructor(private readonly stockCategoriesService: StockCategoriesService) {}

  @Get()
  async findAll(): Promise<StockCategory[]> {
    this.logger.debug('GET /api/admin/stock-categories');
    return this.stockCategoriesService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateStockCategoryDto): Promise<StockCategory> {
    this.logger.log(`POST /api/admin/stock-categories - nombre: "${dto.name}"`);
    return this.stockCategoriesService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockCategoryDto,
  ): Promise<StockCategory> {
    this.logger.log(`PUT /api/admin/stock-categories/${id}`);
    return this.stockCategoriesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/stock-categories/${id}`);
    await this.stockCategoriesService.softRemove(id);
    return { ok: true };
  }
}
