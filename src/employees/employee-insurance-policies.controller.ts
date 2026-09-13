import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { buildPdfMemoryMulterOptions, saveRawFile } from '@/common/utils/file-upload.util';
import { EmployeeInsurancePolicy } from '@/database/entities/employee-insurance-policy.entity';
import { CreateEmployeeInsurancePolicyDto } from './dto/create-employee-insurance-policy.dto';
import { UpdateEmployeeInsurancePolicyDto } from './dto/update-employee-insurance-policy.dto';
import { EmployeeInsurancePoliciesService } from './employee-insurance-policies.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/employees/:employeeId/insurance-policies')
export class EmployeeInsurancePoliciesController {
  private readonly logger = new Logger(EmployeeInsurancePoliciesController.name);

  constructor(private readonly insurancePoliciesService: EmployeeInsurancePoliciesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', buildPdfMemoryMulterOptions()))
  async create(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() dto: CreateEmployeeInsurancePolicyDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<EmployeeInsurancePolicy> {
    this.logger.log(`POST /api/admin/employees/${employeeId}/insurance-policies`);
    if (!file) throw new BadRequestException('El archivo PDF de la póliza es obligatorio.');
    const filePath = await saveRawFile(file, 'insurance-policies');
    return this.insurancePoliciesService.create(employeeId, dto, filePath);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file', buildPdfMemoryMulterOptions()))
  async update(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeInsurancePolicyDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<EmployeeInsurancePolicy> {
    this.logger.log(`PUT /api/admin/employees/${employeeId}/insurance-policies/${id}`);
    const filePath = file ? await saveRawFile(file, 'insurance-policies') : undefined;
    return this.insurancePoliciesService.update(employeeId, id, dto, filePath);
  }

  @Delete(':id')
  async remove(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/employees/${employeeId}/insurance-policies/${id}`);
    await this.insurancePoliciesService.remove(employeeId, id);
    return { ok: true };
  }
}
