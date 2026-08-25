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
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { UpdateStockItemDto } from './dto/update-stock-item.dto';
import { StockItemsService, StockItemView } from './stock-items.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/stock-items')
export class StockItemsController {
  private readonly logger = new Logger(StockItemsController.name);

  constructor(private readonly stockItemsService: StockItemsService) {}

  @Get()
  async findAll(): Promise<StockItemView[]> {
    this.logger.debug('GET /api/admin/stock-items');
    return this.stockItemsService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateStockItemDto): Promise<StockItemView> {
    this.logger.log(`POST /api/admin/stock-items - nombre: "${dto.name}"`);
    return this.stockItemsService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockItemDto,
  ): Promise<StockItemView> {
    this.logger.log(`PUT /api/admin/stock-items/${id}`);
    return this.stockItemsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/stock-items/${id}`);
    await this.stockItemsService.softRemove(id);
    return { ok: true };
  }
}
