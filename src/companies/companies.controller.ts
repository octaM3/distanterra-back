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
import { Company } from '@/database/entities/company.entity';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/companies')
export class CompaniesController {
  private readonly logger = new Logger(CompaniesController.name);

  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll(): Promise<Company[]> {
    this.logger.debug('GET /api/admin/companies');
    return this.companiesService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateCompanyDto): Promise<Company> {
    this.logger.log(`POST /api/admin/companies - nombre: "${dto.name}"`);
    return this.companiesService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyDto,
  ): Promise<Company> {
    this.logger.log(`PUT /api/admin/companies/${id}`);
    return this.companiesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/companies/${id}`);
    await this.companiesService.softRemove(id);
    return { ok: true };
  }
}
