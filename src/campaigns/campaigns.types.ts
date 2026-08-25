import { StockPricingType } from '@/database/entities/stock-item.entity';
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
  unit: string;
  quantity: number;
  pricingType: StockPricingType;
  unitPrice: number;
  cost: number;
  notes: string | null;
  createdAt: Date;
}

export interface CampaignExpenseView {
  id: number;
  description: string;
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
  stockItems: CampaignStockItemView[];
  stockItemsTotalCost: number;
  expenses: CampaignExpenseView[];
  expensesTotal: number;
  expensesByMonth: CampaignExpenseMonthSummary[];
  activityLogs: CampaignActivityLogView[];
  grandTotal: number;
}
