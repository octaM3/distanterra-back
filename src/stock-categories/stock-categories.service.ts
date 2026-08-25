import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockCategory } from '@/database/entities/stock-category.entity';
import { CreateStockCategoryDto } from './dto/create-stock-category.dto';
import { UpdateStockCategoryDto } from './dto/update-stock-category.dto';

@Injectable()
export class StockCategoriesService {
  private readonly logger = new Logger(StockCategoriesService.name);

  constructor(
    @InjectRepository(StockCategory)
    private readonly stockCategoryRepository: Repository<StockCategory>,
  ) {}

  findAll(): Promise<StockCategory[]> {
    this.logger.debug('Obteniendo todas las categorías de stock');
    return this.stockCategoryRepository.find({ order: { name: 'ASC' } });
  }

  async findOneOrFail(id: number): Promise<StockCategory> {
    const category = await this.stockCategoryRepository.findOne({ where: { id } });
    if (!category) {
      this.logger.warn(`Categoría de stock con id=${id} no encontrada`);
      throw new NotFoundException(`Categoría de stock ${id} no encontrada`);
    }
    return category;
  }

  async create(dto: CreateStockCategoryDto): Promise<StockCategory> {
    this.logger.log(`Creando categoría de stock: "${dto.name}"`);
    const category = this.stockCategoryRepository.create(dto);
    const saved = await this.stockCategoryRepository.save(category);
    this.logger.log(`Categoría de stock creada con id=${saved.id}`);
    return saved;
  }

  async update(id: number, dto: UpdateStockCategoryDto): Promise<StockCategory> {
    this.logger.log(`Actualizando categoría de stock id=${id}`);
    const category = await this.findOneOrFail(id);
    Object.assign(category, dto);
    const saved = await this.stockCategoryRepository.save(category);
    this.logger.log(`Categoría de stock id=${id} actualizada correctamente`);
    return saved;
  }

  async softRemove(id: number): Promise<void> {
    this.logger.log(`Eliminando (soft) categoría de stock id=${id}`);
    const category = await this.findOneOrFail(id);
    const itemsCount = await this.stockCategoryRepository.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('stock_items', 'si')
      .where('si.category_id = :id', { id })
      .andWhere('si.deleted_at IS NULL')
      .getRawOne<{ count: string }>();
    if (itemsCount && parseInt(itemsCount.count, 10) > 0) {
      throw new BadRequestException(
        'No se puede eliminar la categoría: hay ítems de stock que la usan. Reasígnelos primero.',
      );
    }
    await this.stockCategoryRepository.softRemove(category);
    this.logger.log(`Categoría de stock id=${id} eliminada correctamente`);
  }
}
