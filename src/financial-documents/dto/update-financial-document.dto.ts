import { PartialType } from '@nestjs/mapped-types';
import { CreateFinancialDocumentDto } from './create-financial-document.dto';

// El PDF es opcional al editar: si no se manda uno nuevo, se conserva el cargado.
export class UpdateFinancialDocumentDto extends PartialType(CreateFinancialDocumentDto) {}
