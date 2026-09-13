import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { deleteUploadedFile } from '@/common/utils/file-upload.util';
import { EmployeeInsurancePolicy } from '@/database/entities/employee-insurance-policy.entity';
import { CreateEmployeeInsurancePolicyDto } from './dto/create-employee-insurance-policy.dto';
import { UpdateEmployeeInsurancePolicyDto } from './dto/update-employee-insurance-policy.dto';
import { EmployeesService } from './employees.service';

@Injectable()
export class EmployeeInsurancePoliciesService {
  private readonly logger = new Logger(EmployeeInsurancePoliciesService.name);

  constructor(
    @InjectRepository(EmployeeInsurancePolicy)
    private readonly insurancePolicyRepository: Repository<EmployeeInsurancePolicy>,
    private readonly employeesService: EmployeesService,
  ) {}

  async findOneOrFail(employeeId: number, id: number): Promise<EmployeeInsurancePolicy> {
    const policy = await this.insurancePolicyRepository.findOne({ where: { id, employeeId } });
    if (!policy) {
      this.logger.warn(`Póliza de seguro id=${id} (empleado ${employeeId}) no encontrada`);
      throw new NotFoundException(`Póliza de seguro ${id} no encontrada`);
    }
    return policy;
  }

  private assertDateRange(coveredFrom: string, coveredTo: string): void {
    if (coveredTo < coveredFrom) {
      throw new BadRequestException(
        'La fecha de fin de cobertura no puede ser anterior a la de inicio.',
      );
    }
  }

  async create(
    employeeId: number,
    dto: CreateEmployeeInsurancePolicyDto,
    filePath: string,
  ): Promise<EmployeeInsurancePolicy> {
    await this.employeesService.findOneOrFail(employeeId);
    this.assertDateRange(dto.coveredFrom, dto.coveredTo);
    this.logger.log(
      `Creando póliza de seguro para empleado ${employeeId}: "${dto.insuranceType}" (hasta ${dto.coveredTo})`,
    );
    const policy = this.insurancePolicyRepository.create({ ...dto, employeeId, filePath });
    return this.insurancePolicyRepository.save(policy);
  }

  async update(
    employeeId: number,
    id: number,
    dto: UpdateEmployeeInsurancePolicyDto,
    filePath: string | undefined,
  ): Promise<EmployeeInsurancePolicy> {
    const policy = await this.findOneOrFail(employeeId, id);
    const previousFilePath = policy.filePath;

    Object.assign(policy, dto);
    if (filePath !== undefined) policy.filePath = filePath;
    this.assertDateRange(policy.coveredFrom, policy.coveredTo);

    this.logger.log(`Actualizando póliza de seguro id=${id}`);
    const saved = await this.insurancePolicyRepository.save(policy);

    if (filePath !== undefined && previousFilePath !== filePath) {
      await deleteUploadedFile(previousFilePath);
    }
    return saved;
  }

  async remove(employeeId: number, id: number): Promise<void> {
    const policy = await this.findOneOrFail(employeeId, id);
    this.logger.log(`Eliminando póliza de seguro id=${id} (empleado ${employeeId})`);
    await this.insurancePolicyRepository.softRemove(policy);
  }
}
