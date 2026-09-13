import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { deleteUploadedFile } from '@/common/utils/file-upload.util';
import { EmployeeMedicalExam } from '@/database/entities/employee-medical-exam.entity';
import { CreateEmployeeMedicalExamDto } from './dto/create-employee-medical-exam.dto';
import { UpdateEmployeeMedicalExamDto } from './dto/update-employee-medical-exam.dto';
import { EmployeesService } from './employees.service';

@Injectable()
export class EmployeeMedicalExamsService {
  private readonly logger = new Logger(EmployeeMedicalExamsService.name);

  constructor(
    @InjectRepository(EmployeeMedicalExam)
    private readonly medicalExamRepository: Repository<EmployeeMedicalExam>,
    private readonly employeesService: EmployeesService,
  ) {}

  async findOneOrFail(employeeId: number, id: number): Promise<EmployeeMedicalExam> {
    const exam = await this.medicalExamRepository.findOne({ where: { id, employeeId } });
    if (!exam) {
      this.logger.warn(`Estudio médico id=${id} (empleado ${employeeId}) no encontrado`);
      throw new NotFoundException(`Estudio médico ${id} no encontrado`);
    }
    return exam;
  }

  private assertDateRange(examDate: string, expiresAt: string): void {
    if (expiresAt < examDate) {
      throw new BadRequestException(
        'La fecha de vencimiento no puede ser anterior a la fecha del estudio.',
      );
    }
  }

  async create(
    employeeId: number,
    dto: CreateEmployeeMedicalExamDto,
    filePath: string,
  ): Promise<EmployeeMedicalExam> {
    await this.employeesService.findOneOrFail(employeeId);
    this.assertDateRange(dto.examDate, dto.expiresAt);
    this.logger.log(`Creando estudio médico para empleado ${employeeId} (vence ${dto.expiresAt})`);
    const exam = this.medicalExamRepository.create({ ...dto, employeeId, filePath });
    return this.medicalExamRepository.save(exam);
  }

  async update(
    employeeId: number,
    id: number,
    dto: UpdateEmployeeMedicalExamDto,
    filePath: string | undefined,
  ): Promise<EmployeeMedicalExam> {
    const exam = await this.findOneOrFail(employeeId, id);
    const previousFilePath = exam.filePath;

    Object.assign(exam, dto);
    if (filePath !== undefined) exam.filePath = filePath;
    this.assertDateRange(exam.examDate, exam.expiresAt);

    this.logger.log(`Actualizando estudio médico id=${id}`);
    const saved = await this.medicalExamRepository.save(exam);

    if (filePath !== undefined && previousFilePath !== filePath) {
      await deleteUploadedFile(previousFilePath);
    }
    return saved;
  }

  async remove(employeeId: number, id: number): Promise<void> {
    const exam = await this.findOneOrFail(employeeId, id);
    this.logger.log(`Eliminando estudio médico id=${id} (empleado ${employeeId})`);
    await this.medicalExamRepository.softRemove(exam);
  }
}
