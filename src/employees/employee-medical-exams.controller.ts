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
import { EmployeeMedicalExam } from '@/database/entities/employee-medical-exam.entity';
import { CreateEmployeeMedicalExamDto } from './dto/create-employee-medical-exam.dto';
import { UpdateEmployeeMedicalExamDto } from './dto/update-employee-medical-exam.dto';
import { EmployeeMedicalExamsService } from './employee-medical-exams.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/employees/:employeeId/medical-exams')
export class EmployeeMedicalExamsController {
  private readonly logger = new Logger(EmployeeMedicalExamsController.name);

  constructor(private readonly medicalExamsService: EmployeeMedicalExamsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', buildPdfMemoryMulterOptions()))
  async create(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() dto: CreateEmployeeMedicalExamDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<EmployeeMedicalExam> {
    this.logger.log(`POST /api/admin/employees/${employeeId}/medical-exams`);
    if (!file) throw new BadRequestException('El archivo PDF del estudio médico es obligatorio.');
    const filePath = await saveRawFile(file, 'medical-exams');
    return this.medicalExamsService.create(employeeId, dto, filePath);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file', buildPdfMemoryMulterOptions()))
  async update(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeMedicalExamDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<EmployeeMedicalExam> {
    this.logger.log(`PUT /api/admin/employees/${employeeId}/medical-exams/${id}`);
    const filePath = file ? await saveRawFile(file, 'medical-exams') : undefined;
    return this.medicalExamsService.update(employeeId, id, dto, filePath);
  }

  @Delete(':id')
  async remove(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/employees/${employeeId}/medical-exams/${id}`);
    await this.medicalExamsService.remove(employeeId, id);
    return { ok: true };
  }
}
