import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialDocument } from '@/database/entities/financial-document.entity';
import { ServiceRecord } from '@/database/entities/service-record.entity';
import { FinancialDocumentsController } from './financial-documents.controller';
import { FinancialDocumentsService } from './financial-documents.service';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialDocument, ServiceRecord])],
  controllers: [FinancialDocumentsController],
  providers: [FinancialDocumentsService],
})
export class FinancialDocumentsModule {}
