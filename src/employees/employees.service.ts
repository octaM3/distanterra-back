import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { AppConfig } from '@/config/configuration';
import { deleteUploadedFile } from '@/common/utils/file-upload.util';
import { toFileUrl } from '@/common/utils/file-url.util';
import { Employee } from '@/database/entities/employee.entity';
import { EmployeeInsurancePolicy } from '@/database/entities/employee-insurance-policy.entity';
import { EmployeeMedicalExam } from '@/database/entities/employee-medical-exam.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeDetail, EmployeeListItem } from './employees.types';

/** Las dos fotos del DNI, ya guardadas en disco: null = borrar la que había, undefined = no tocar. */
export interface EmployeeDniImages {
  dniFrontImagePath?: string | null;
  dniBackImagePath?: string | null;
}

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeMedicalExam)
    private readonly medicalExamRepository: Repository<EmployeeMedicalExam>,
    @InjectRepository(EmployeeInsurancePolicy)
    private readonly insurancePolicyRepository: Repository<EmployeeInsurancePolicy>,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  private get apiUrl(): string {
    return this.configService.get('apiUrl', { infer: true });
  }

  private toListItem(
    employee: Employee,
    medicalExamExpiresAt: string | null,
    insuranceCoveredTo: string | null,
  ): EmployeeListItem {
    return {
      id: employee.id,
      fullName: employee.fullName,
      dni: employee.dni,
      birthDate: employee.birthDate,
      hasPpe: employee.hasPpe,
      employmentStatus: employee.employmentStatus,
      dailyRateArs: employee.dailyRateArs,
      dailyRateUsd: employee.dailyRateUsd,
      medicalExamExpiresAt,
      insuranceCoveredTo,
      createdAt: employee.createdAt,
    };
  }

  async findAll(): Promise<EmployeeListItem[]> {
    this.logger.debug('Obteniendo todos los empleados');
    const employees = await this.employeeRepository.find({ order: { fullName: 'ASC' } });
    if (employees.length === 0) return [];

    // Vencimiento más lejano por empleado de cada tipo de documentación: es el
    // que define si hoy está cubierto, sin traer todos los documentos.
    const employeeIds = employees.map((e) => e.id);
    const [examRows, policyRows] = await Promise.all([
      this.medicalExamRepository
        .createQueryBuilder('exam')
        .select('exam.employee_id', 'employeeId')
        .addSelect('MAX(exam.expires_at)', 'expiresAt')
        .where('exam.employee_id IN (:...employeeIds)', { employeeIds })
        .andWhere('exam.deleted_at IS NULL')
        .groupBy('exam.employee_id')
        .getRawMany<{ employeeId: number; expiresAt: string }>(),
      this.insurancePolicyRepository
        .createQueryBuilder('policy')
        .select('policy.employee_id', 'employeeId')
        .addSelect('MAX(policy.covered_to)', 'coveredTo')
        .where('policy.employee_id IN (:...employeeIds)', { employeeIds })
        .andWhere('policy.deleted_at IS NULL')
        .groupBy('policy.employee_id')
        .getRawMany<{ employeeId: number; coveredTo: string }>(),
    ]);

    const examByEmployee = new Map(examRows.map((r) => [Number(r.employeeId), r.expiresAt]));
    const policyByEmployee = new Map(policyRows.map((r) => [Number(r.employeeId), r.coveredTo]));

    return employees.map((e) =>
      this.toListItem(e, examByEmployee.get(e.id) ?? null, policyByEmployee.get(e.id) ?? null),
    );
  }

  async findOneOrFail(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) {
      this.logger.warn(`Empleado con id=${id} no encontrado`);
      throw new NotFoundException(`Empleado ${id} no encontrado`);
    }
    return employee;
  }

  async findDetailOrFail(id: number): Promise<EmployeeDetail> {
    const employee = await this.findOneOrFail(id);
    const [medicalExams, insurancePolicies] = await Promise.all([
      this.medicalExamRepository.find({
        where: { employeeId: id },
        order: { expiresAt: 'DESC' },
      }),
      this.insurancePolicyRepository.find({
        where: { employeeId: id },
        order: { coveredTo: 'DESC' },
      }),
    ]);

    const apiUrl = this.apiUrl;
    return {
      ...this.toListItem(
        employee,
        medicalExams[0]?.expiresAt ?? null,
        insurancePolicies[0]?.coveredTo ?? null,
      ),
      dniFrontUrl: toFileUrl(apiUrl, employee.dniFrontImagePath),
      dniBackUrl: toFileUrl(apiUrl, employee.dniBackImagePath),
      bankCvu: employee.bankCvu,
      bankAlias: employee.bankAlias,
      bankHolder: employee.bankHolder,
      notes: employee.notes,
      medicalExams: medicalExams.map((exam) => ({
        id: exam.id,
        examDate: exam.examDate,
        expiresAt: exam.expiresAt,
        fileUrl: toFileUrl(apiUrl, exam.filePath),
        createdAt: exam.createdAt,
      })),
      insurancePolicies: insurancePolicies.map((policy) => ({
        id: policy.id,
        insuranceType: policy.insuranceType,
        coveredFrom: policy.coveredFrom,
        coveredTo: policy.coveredTo,
        fileUrl: toFileUrl(apiUrl, policy.filePath),
        createdAt: policy.createdAt,
      })),
      updatedAt: employee.updatedAt,
    };
  }

  /** El DNI no se puede repetir entre empleados vigentes (hay un índice único parcial que lo respalda). */
  private async assertDniIsFree(dni: string, excludeId?: number): Promise<void> {
    const existing = await this.employeeRepository.findOne({
      where: excludeId ? { dni, id: Not(excludeId) } : { dni },
    });
    if (existing) {
      throw new BadRequestException(`Ya existe un empleado cargado con el DNI ${dni}.`);
    }
  }

  async create(dto: CreateEmployeeDto, images: EmployeeDniImages): Promise<EmployeeDetail> {
    await this.assertDniIsFree(dto.dni);
    this.logger.log(`Creando empleado: "${dto.fullName}" (DNI ${dto.dni})`);
    const employee = this.employeeRepository.create({
      ...dto,
      dniFrontImagePath: images.dniFrontImagePath ?? null,
      dniBackImagePath: images.dniBackImagePath ?? null,
    });
    const saved = await this.employeeRepository.save(employee);
    this.logger.log(`Empleado creado con id=${saved.id}`);
    return this.findDetailOrFail(saved.id);
  }

  async update(
    id: number,
    dto: UpdateEmployeeDto,
    images: EmployeeDniImages,
  ): Promise<EmployeeDetail> {
    const employee = await this.findOneOrFail(id);
    if (dto.dni && dto.dni !== employee.dni) await this.assertDniIsFree(dto.dni, id);

    const previousFront = employee.dniFrontImagePath;
    const previousBack = employee.dniBackImagePath;

    Object.assign(employee, dto);
    if (images.dniFrontImagePath !== undefined) {
      employee.dniFrontImagePath = images.dniFrontImagePath;
    }
    if (images.dniBackImagePath !== undefined) {
      employee.dniBackImagePath = images.dniBackImagePath;
    }

    this.logger.log(`Actualizando empleado id=${id}`);
    await this.employeeRepository.save(employee);

    if (previousFront && previousFront !== employee.dniFrontImagePath) {
      await deleteUploadedFile(previousFront);
    }
    if (previousBack && previousBack !== employee.dniBackImagePath) {
      await deleteUploadedFile(previousBack);
    }

    return this.findDetailOrFail(id);
  }

  async softRemove(id: number): Promise<void> {
    const employee = await this.findOneOrFail(id);
    this.logger.log(`Eliminando (soft) empleado id=${id}`);
    await this.employeeRepository.softRemove(employee);
  }
}
