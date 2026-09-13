import { Body, Controller, Get, Logger, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UpdateServiceRecordDto } from './dto/update-service-record.dto';
import { ServiceRecordsService, ServiceRecordView } from './service-records.service';

// Sin POST ni DELETE a propósito: los ítems de gestión se crean y se eliminan
// junto con su campaña o servicio (ver CampaignsService), para que ninguno
// quede fuera del control de facturación ni suelto sin su trabajo asociado.
@UseGuards(JwtAuthGuard)
@Controller('admin/service-records')
export class ServiceRecordsController {
  private readonly logger = new Logger(ServiceRecordsController.name);

  constructor(private readonly serviceRecordsService: ServiceRecordsService) {}

  @Get()
  async findAll(): Promise<ServiceRecordView[]> {
    this.logger.debug('GET /api/admin/service-records');
    return this.serviceRecordsService.findAll();
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceRecordDto,
  ): Promise<ServiceRecordView> {
    this.logger.log(`PUT /api/admin/service-records/${id}`);
    return this.serviceRecordsService.update(id, dto);
  }
}
