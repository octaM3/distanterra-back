import { StockPricingType } from '@/database/entities/stock-item.entity';

export type CampaignStatus = 'planificada' | 'en_curso' | 'finalizada';

/**
 * El estado no se guarda en la base: se calcula a partir de las fechas y de
 * finished_at para que siempre refleje la realidad sin necesidad de un job
 * que lo actualice.
 */
export function computeCampaignStatus(startDate: string, finishedAt: Date | null): CampaignStatus {
  if (finishedAt) return 'finalizada';
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(`${startDate}T00:00:00Z`);
  return today.getTime() >= start.getTime() ? 'en_curso' : 'planificada';
}

/** Cantidad de días entre dos fechas "YYYY-MM-DD", ambas inclusive. */
export function daysBetweenInclusive(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

/**
 * Fecha de fin "efectiva" para el cálculo de costos: si la campaña ya
 * finalizó, se usa la fecha en la que finalizó (el costo queda congelado);
 * si no, se usa la fecha de fin planificada (vigente/ampliable).
 */
export function effectiveEndDate(campaign: { endDate: string; finishedAt: Date | null }): string {
  if (campaign.finishedAt) {
    return campaign.finishedAt.toISOString().slice(0, 10);
  }
  return campaign.endDate;
}

/**
 * Costo de un ítem de stock asignado durante la duración de la campaña.
 * per_day: precio unitario x cantidad x días. per_month: precio unitario x
 * cantidad x meses (redondeando hacia arriba, práctica habitual de alquiler).
 */
export function computeStockItemCost(
  pricingType: StockPricingType,
  unitPrice: number,
  quantity: number,
  durationDays: number,
): number {
  if (pricingType === 'none') return 0;
  if (pricingType === 'per_day') return unitPrice * quantity * durationDays;
  const months = Math.ceil(durationDays / 30);
  return unitPrice * quantity * months;
}

/** Clave "YYYY-MM" de una fecha "YYYY-MM-DD", usada para agrupar gastos por mes. */
export function monthKeyOf(dateStr: string): string {
  return dateStr.slice(0, 7);
}

const STATUS_LABELS: Record<CampaignStatus, string> = {
  planificada: 'Planificada',
  en_curso: 'En curso',
  finalizada: 'Finalizada',
};

export function campaignStatusLabel(status: CampaignStatus): string {
  return STATUS_LABELS[status];
}

const PRICING_TYPE_LABELS: Record<StockPricingType, string> = {
  per_day: 'Por día',
  per_month: 'Por mes',
  none: 'Sin costo',
};

export function pricingTypeLabel(pricingType: StockPricingType): string {
  return PRICING_TYPE_LABELS[pricingType];
}
