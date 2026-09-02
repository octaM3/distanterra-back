import { BadRequestException } from '@nestjs/common';
import { toLocalDateString, todayLocalDateString } from '@/common/utils/date.util';

export type CampaignStatus = 'planificada' | 'en_curso' | 'finalizada';

/**
 * El estado no se guarda en la base: se calcula a partir de las fechas y de
 * finished_at para que siempre refleje la realidad sin necesidad de un job
 * que lo actualice. Compara contra la fecha de hoy en el huso horario del
 * negocio (ver todayLocalDateString), no UTC — si no, el estado se adelanta
 * un día durante la ventana en la que UTC ya cruzó la medianoche pero acá
 * todavía no.
 */
export function computeCampaignStatus(startDate: string, finishedAt: Date | null): CampaignStatus {
  if (finishedAt) return 'finalizada';
  return todayLocalDateString() >= startDate ? 'en_curso' : 'planificada';
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
    return toLocalDateString(campaign.finishedAt);
  }
  return campaign.endDate;
}

/**
 * Costo de un rango de días combinando precio diario y/o mensual: usa
 * meses completos (bloques de 30 días) al precio mensual y los días
 * sueltos restantes al precio diario. Si solo hay uno de los dos precios
 * cargado se usa ese exclusivamente (con el mes redondeado hacia arriba si
 * falta el precio diario para cubrir el resto, práctica habitual de
 * alquiler). Sin ningún precio cargado, el costo es 0.
 */
export function computeBlendedUnitCost(
  pricePerDay: number | null,
  pricePerMonth: number | null,
  durationDays: number,
): number {
  if (pricePerDay != null && pricePerMonth != null) {
    const months = Math.floor(durationDays / 30);
    const remainderDays = durationDays - months * 30;
    return months * pricePerMonth + remainderDays * pricePerDay;
  }
  if (pricePerDay != null) return pricePerDay * durationDays;
  if (pricePerMonth != null) return Math.ceil(durationDays / 30) * pricePerMonth;
  return 0;
}

/**
 * Costo de un ítem de stock asignado durante la duración de la campaña:
 * costo combinado (ver computeBlendedUnitCost) x cantidad. "Sin costo" es
 * un override explícito que ignora los precios y deja el costo en 0.
 */
export function computeStockItemCost(
  noCost: boolean,
  pricePerDay: number | null,
  pricePerMonth: number | null,
  quantity: number,
  durationDays: number,
): number {
  if (noCost) return 0;
  return computeBlendedUnitCost(pricePerDay, pricePerMonth, durationDays) * quantity;
}

/**
 * Costo de un vehículo asignado: igual que un ítem de stock pero sin
 * cantidad (siempre es 1 unidad). No existe un precio de "campaña
 * completa" aparte: para cobrar la campaña entera simplemente se asigna
 * con el rango de fechas igual a la duración completa de la campaña (ver
 * duración "toda la expedición" en el form), y el costo sale de acá igual.
 */
export function computeVehicleCost(
  pricePerDay: number | null,
  pricePerMonth: number | null,
  durationDays: number,
): number {
  return computeBlendedUnitCost(pricePerDay, pricePerMonth, durationDays);
}

/**
 * Costo de los baqueanos agregados a una campaña: precio por día x
 * cantidad de baqueanos x cantidad de días, con el % de impuestos
 * aplicado encima. Sin precio cargado en guide_settings el costo es 0 (el
 * admin puede usar manual_cost para esos casos).
 */
export function computeGuideCost(
  pricePerDay: number | null,
  taxPercentage: number | null,
  quantity: number,
  durationDays: number,
): number {
  if (pricePerDay == null) return 0;
  const taxMultiplier = 1 + (taxPercentage ?? 0) / 100;
  return pricePerDay * durationDays * taxMultiplier * quantity;
}

/**
 * Valida que el rango de una asignación (ítem de stock o vehículo) a una
 * campaña sea coherente (fin >= inicio) y caiga dentro de la duración de
 * esa campaña. Usado tanto por CampaignStockService como por
 * CampaignVehiclesService.
 */
export function validateAssignmentDateRange(
  campaign: { startDate: string; endDate: string; finishedAt: Date | null },
  startDate: string,
  endDate: string,
): void {
  if (new Date(endDate) < new Date(startDate)) {
    throw new BadRequestException('La fecha "hasta" no puede ser anterior a la fecha "desde".');
  }
  const campaignStart = campaign.startDate;
  const campaignEnd = effectiveEndDate(campaign);
  if (new Date(startDate) < new Date(campaignStart) || new Date(endDate) > new Date(campaignEnd)) {
    throw new BadRequestException(
      `El rango debe estar dentro de la duración de la campaña (${campaignStart} a ${campaignEnd}).`,
    );
  }
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
