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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { buildImageMemoryMulterOptions } from '@/common/utils/file-upload.util';
import { optimizeAndSaveImage } from '@/common/utils/image-optimizer.util';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeDniImages, EmployeesService } from './employees.service';
import { EmployeeDetail, EmployeeListItem } from './employees.types';

/** Las dos fotos del DNI llegan como campos separados del mismo multipart. */
const dniImageFields = [
  { name: 'dniFront', maxCount: 1 },
  { name: 'dniBack', maxCount: 1 },
];

type DniUploads = { dniFront?: Express.Multer.File[]; dniBack?: Express.Multer.File[] };

@UseGuards(JwtAuthGuard)
@Controller('admin/employees')
export class EmployeesController {
  private readonly logger = new Logger(EmployeesController.name);

  constructor(private readonly employeesService: EmployeesService) {}

  /** Guarda las fotos que hayan venido; las ausentes quedan en undefined ("no tocar"). */
  private async saveDniImages(files: DniUploads | undefined): Promise<EmployeeDniImages> {
    const images: EmployeeDniImages = {};
    const front = files?.dniFront?.[0];
    const back = files?.dniBack?.[0];
    if (front) images.dniFrontImagePath = await optimizeAndSaveImage(front, 'employees');
    if (back) images.dniBackImagePath = await optimizeAndSaveImage(back, 'employees');
    return images;
  }

  @Get()
  async findAll(): Promise<EmployeeListItem[]> {
    this.logger.debug('GET /api/admin/employees');
    return this.employeesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<EmployeeDetail> {
    this.logger.debug(`GET /api/admin/employees/${id}`);
    return this.employeesService.findDetailOrFail(id);
  }

  @Post()
  @UseInterceptors(FileFieldsInterceptor(dniImageFields, buildImageMemoryMulterOptions()))
  async create(
    @Body() dto: CreateEmployeeDto,
    @UploadedFiles() files: DniUploads | undefined,
  ): Promise<EmployeeDetail> {
    this.logger.log(`POST /api/admin/employees - "${dto.fullName}"`);
    return this.employeesService.create(dto, await this.saveDniImages(files));
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor(dniImageFields, buildImageMemoryMulterOptions()))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
    @UploadedFiles() files: DniUploads | undefined,
  ): Promise<EmployeeDetail> {
    this.logger.log(`PUT /api/admin/employees/${id}`);
    return this.employeesService.update(id, dto, await this.saveDniImages(files));
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/employees/${id}`);
    await this.employeesService.softRemove(id);
    return { ok: true };
  }
}
