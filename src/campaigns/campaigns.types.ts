import { CampaignStatus } from './campaigns.util';

export interface CampaignListItem {
  id: number;
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

export interface CampaignExpenseView {
  id: number;
  description: string;
  categoryId: number | null;
  category: string | null;
  amount: number;
  expenseDate: string;
  invoiceUrl: string | null;
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
  expenses: CampaignExpenseView[];
  expensesTotal: number;
  expensesByMonth: CampaignExpenseMonthSummary[];
  activityLogs: CampaignActivityLogView[];
  grandTotal: number;
}
