import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from '@/database/entities/campaign.entity';
import { Company } from '@/database/entities/company.entity';
import { FinancialDocument } from '@/database/entities/financial-document.entity';
import { ServiceRecord } from '@/database/entities/service-record.entity';
import { ServiceRecordsController } from './service-records.controller';
import { ServiceRecordsService } from './service-records.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRecord, Company, Campaign, FinancialDocument])],
  controllers: [ServiceRecordsController],
  providers: [ServiceRecordsService],
  // CampaignsModule lo usa para crear/eliminar el ítem de gestión junto con la campaña.
  exports: [ServiceRecordsService],
})
export class ServiceRecordsModule {}
