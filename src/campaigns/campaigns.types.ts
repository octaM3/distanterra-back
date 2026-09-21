import { InvoiceType } from '@/database/entities/campaign-expense.entity';
import { CampaignApprovalStatus, CampaignKind } from '@/database/entities/campaign.entity';
import { CampaignStatus } from './campaigns.util';

export interface CampaignListItem {
  id: number;
  kind: CampaignKind;
  approvalStatus: CampaignApprovalStatus;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  taxPercentage: number | null;
  companyId: number;
  companyName: string;
  name: string;
  location: string | null;
  startDate: string;
  endDate: string;
  finishedAt: Date | null;
  status: CampaignStatus;
  createdAt: Date;
}

export interface CampaignStockItemView {
  id: number;
  stockItemId: number;
  stockItemName: string;
  category: string;
  quantity: number;
  noCost: boolean;
  pricePerDay: number | null;
  pricePerMonth: number | null;
  manualCost: number | null;
  recommendedCost: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  cost: number;
  notes: string | null;
  createdAt: Date;
}

export interface CampaignVehicleView {
  id: number;
  vehicleId: number;
  licensePlate: string;
  vehicleDescription: string | null;
  pricePerDay: number | null;
  pricePerMonth: number | null;
  manualCost: number | null;
  recommendedCost: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  cost: number;
  notes: string | null;
  createdAt: Date;
}

export interface CampaignGuideView {
  id: number;
  quantity: number;
  // Cargado directamente en el formulario al agregar (ver computeGuideCost).
  pricePerDay: number | null;
  taxPercentage: number | null;
  manualCost: number | null;
  recommendedCost: number;
  cost: number;
  notes: string | null;
  // Rango dentro de la campaña: determina la cantidad de días que se
  // cobra (ver computeGuideCost).
  startDate: string;
  endDate: string;
  durationDays: number;
  createdAt: Date;
}

export interface CampaignPackAnimalView {
  id: number;
  animalType: string;
  quantity: number;
  // Cargado directamente en el formulario al asignar (ver computeGuideCost,
  // misma fórmula que CampaignGuideView).
  pricePerDay: number | null;
  taxPercentage: number | null;
  manualCost: number | null;
  recommendedCost: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  cost: number;
  notes: string | null;
  createdAt: Date;
}

export interface CampaignExpenseView {
  id: number;
  description: string;
  categoryId: number | null;
  category: string | null;
  amountUsd: number | null;
  amountArs: number | null;
  expenseDate: string;
  invoiceUrl: string | null;
  invoiceType: InvoiceType | null;
  invoiceNumber: string | null;
  businessName: string | null;
  createdAt: Date;
}

export interface CampaignActivityLogView {
  id: number;
  logDate: string;
  description: string;
  createdByUsername: string | null;
  createdAt: Date;
}

export interface CampaignExpenseMonthSummary {
  month: string;
  total: number;
}

export interface CampaignDetail extends CampaignListItem {
  description: string | null;
  durationDays: number;
  stockItems: CampaignStockItemView[];
  stockItemsTotalCost: number;
  vehicles: CampaignVehicleView[];
  vehiclesTotalCost: number;
  guides: CampaignGuideView[];
  guidesTotalCost: number;
  packAnimals: CampaignPackAnimalView[];
  packAnimalsTotalCost: number;
  expenses: CampaignExpenseView[];
  // Suma de amountUsd (USD) — la que entra en grandTotal, junto al resto de
  // los costos de la campaña, todos en USD. amountArs se reporta aparte, sin
  // mezclarlo en ningún total: no hay una tasa de cambio para combinarlos.
  expensesTotal: number;
  expensesTotalArs: number;
  expensesByMonth: CampaignExpenseMonthSummary[];
  activityLogs: CampaignActivityLogView[];
  grandTotal: number;
}
