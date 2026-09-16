import { Injectable, Logger } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { ServiceRecordsService } from '@/service-records/service-records.service';
import { CampaignsService } from './campaigns.service';
import { CampaignDetail } from './campaigns.types';
import { campaignStatusLabel } from './campaigns.util';

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1F2937' },
};
const HEADER_FONT: Partial<ExcelJS.Font> = { color: { argb: 'FFFFFFFF' }, bold: true };
const CURRENCY_FORMAT = '#,##0.00';

@Injectable()
export class CampaignExportService {
  private readonly logger = new Logger(CampaignExportService.name);

  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly serviceRecordsService: ServiceRecordsService,
  ) {}

  private styleHeaderRow(row: ExcelJS.Row): void {
    row.eachCell((cell) => {
      cell.fill = HEADER_FILL;
      cell.font = HEADER_FONT;
    });
  }

  async buildWorkbook(campaignId: number): Promise<{ buffer: Buffer; filename: string }> {
    const detail = await this.campaignsService.getDetail(campaignId);
    this.logger.log(`Generando Excel de campaña id=${campaignId}: "${detail.name}"`);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Distanterra';
    workbook.created = new Date();

    // Un servicio suelto solo tiene stock y vehículos: sus hojas de baqueanos,
    // tracción, gastos y bitácora estarían siempre vacías, así que no se generan.
    const isService = detail.kind === 'servicio';
    const record = await this.serviceRecordsService.findViewByCampaign(campaignId);

    // ---- Hoja 1: Resumen ----
    const summarySheet = workbook.addWorksheet('Resumen');
    summarySheet.columns = [
      { key: 'label', width: 32 },
      { key: 'value', width: 40 },
    ];

    const addSummaryRow = (
      label: string,
      value: string | number,
      options: { money?: boolean; bold?: boolean } = {},
    ) => {
      const row = summarySheet.addRow({ label, value });
      if (options.money) row.getCell('value').numFmt = CURRENCY_FORMAT;
      if (options.bold) row.font = { bold: true };
      return row;
    };

    addSummaryRow(isService ? 'Servicio' : 'Campaña', detail.name, { bold: true });
    addSummaryRow('Empresa', detail.companyName);
    if (!isService) addSummaryRow('Ubicación', detail.location ?? '-');
    addSummaryRow('Estado', campaignStatusLabel(detail.status));
    addSummaryRow('Fecha de inicio', detail.startDate);
    addSummaryRow('Fecha de fin', detail.endDate);
    addSummaryRow('Duración', `${detail.durationDays} día(s)`);
    addSummaryRow(
      'Finalizada el',
      detail.finishedAt ? new Date(detail.finishedAt).toLocaleString('es-AR') : '-',
    );

    summarySheet.addRow({});
    addSummaryRow('Total stock asignado (USD)', detail.stockItemsTotalCost, { money: true });
    addSummaryRow('Total vehículos asignados (USD)', detail.vehiclesTotalCost, { money: true });
    if (!isService) {
      addSummaryRow('Total baqueanos asignados (USD)', detail.guidesTotalCost, { money: true });
      addSummaryRow('Total tracción a sangre asignada (USD)', detail.packAnimalsTotalCost, {
        money: true,
      });
      addSummaryRow('Total gastos extra (USD)', detail.expensesTotal, { money: true });
      // Los gastos en pesos van aparte: no hay tasa de cambio para sumarlos al total.
      addSummaryRow('Total gastos extra (ARS)', detail.expensesTotalArs, { money: true });
    }
    addSummaryRow('TOTAL GENERAL (USD)', detail.grandTotal, { money: true, bold: true });

    // Estado de facturación y cobro, tal como se controla en la sección Gestión.
    if (record) {
      summarySheet.addRow({});
      addSummaryRow('Facturación y cobro', '', { bold: true });
      addSummaryRow('Mes imputado', record.serviceMonth);
      addSummaryRow('Factura', record.invoiceSent ? 'Enviada' : 'Pendiente');
      if (record.invoiceSent) {
        addSummaryRow('N° de factura', record.invoiceNumber ?? '-');
        addSummaryRow('Fecha de emisión', record.invoiceSentAt ?? '-');
        addSummaryRow(
          `Monto facturado (${record.invoiceCurrency ?? '-'})`,
          record.invoiceAmount ?? '-',
          { money: record.invoiceAmount != null },
        );
      }
      addSummaryRow('Pago', record.paymentReceived ? 'Cobrado' : 'Pendiente');
      if (record.paymentReceived) {
        addSummaryRow('Fecha de cobro', record.paymentReceivedAt ?? '-');
        addSummaryRow(
          `Monto cobrado (${record.receiptCurrency ?? '-'})`,
          record.receiptAmount ?? '-',
          { money: record.receiptAmount != null },
        );
      }
      if (record.creditNotesCount > 0) {
        addSummaryRow('Notas de crédito', record.creditNotesCount);
      }
    }

    if (!isService && detail.expensesByMonth.length > 0) {
      summarySheet.addRow({});
      addSummaryRow('Gastos por mes (USD)', '', { bold: true });
      const monthHeaderRow = summarySheet.addRow({ label: 'Mes', value: 'Total' });
      this.styleHeaderRow(monthHeaderRow);
      for (const m of detail.expensesByMonth) {
        const row = summarySheet.addRow({ label: m.month, value: m.total });
        row.getCell('value').numFmt = CURRENCY_FORMAT;
      }
    }

    // ---- Hoja 2: Stock asignado ----
    const stockSheet = workbook.addWorksheet('Stock asignado');
    stockSheet.columns = [
      { header: 'Ítem', key: 'name', width: 30 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Cantidad', key: 'quantity', width: 12 },
      { header: 'Desde', key: 'startDate', width: 14 },
      { header: 'Hasta', key: 'endDate', width: 14 },
      { header: 'Días', key: 'durationDays', width: 10 },
      { header: 'Precio/día', key: 'pricePerDay', width: 14 },
      { header: 'Precio/mes', key: 'pricePerMonth', width: 14 },
      { header: 'Sin costo', key: 'noCost', width: 12 },
      { header: 'Precio manual', key: 'manual', width: 14 },
      { header: 'Costo total', key: 'cost', width: 16 },
      { header: 'Notas', key: 'notes', width: 30 },
    ];
    this.styleHeaderRow(stockSheet.getRow(1));
    for (const item of detail.stockItems) {
      stockSheet.addRow({
        name: item.stockItemName,
        category: item.category,
        quantity: item.quantity,
        startDate: item.startDate,
        endDate: item.endDate,
        durationDays: item.durationDays,
        pricePerDay: item.pricePerDay,
        pricePerMonth: item.pricePerMonth,
        noCost: item.noCost ? 'Sí' : 'No',
        manual: item.manualCost != null ? 'Sí' : 'No',
        cost: item.cost,
        notes: item.notes ?? '',
      });
    }
    stockSheet.getColumn('pricePerDay').numFmt = CURRENCY_FORMAT;
    stockSheet.getColumn('pricePerMonth').numFmt = CURRENCY_FORMAT;
    stockSheet.getColumn('cost').numFmt = CURRENCY_FORMAT;
    const stockTotalRow = stockSheet.addRow({ name: 'TOTAL', cost: detail.stockItemsTotalCost });
    stockTotalRow.font = { bold: true };
    stockTotalRow.getCell('cost').numFmt = CURRENCY_FORMAT;

    // ---- Hoja 3: Vehículos asignados ----
    const vehiclesSheet = workbook.addWorksheet('Vehículos asignados');
    vehiclesSheet.columns = [
      { header: 'Patente', key: 'licensePlate', width: 14 },
      { header: 'Descripción', key: 'description', width: 25 },
      { header: 'Desde', key: 'startDate', width: 14 },
      { header: 'Hasta', key: 'endDate', width: 14 },
      { header: 'Días', key: 'durationDays', width: 10 },
      { header: 'Precio/día', key: 'pricePerDay', width: 14 },
      { header: 'Precio/mes', key: 'pricePerMonth', width: 14 },
      { header: 'Precio manual', key: 'manual', width: 14 },
      { header: 'Costo total', key: 'cost', width: 16 },
      { header: 'Notas', key: 'notes', width: 30 },
    ];
    this.styleHeaderRow(vehiclesSheet.getRow(1));
    for (const v of detail.vehicles) {
      vehiclesSheet.addRow({
        licensePlate: v.licensePlate,
        description: v.vehicleDescription ?? '',
        startDate: v.startDate,
        endDate: v.endDate,
        durationDays: v.durationDays,
        pricePerDay: v.pricePerDay,
        pricePerMonth: v.pricePerMonth,
        manual: v.manualCost != null ? 'Sí' : 'No',
        cost: v.cost,
        notes: v.notes ?? '',
      });
    }
    vehiclesSheet.getColumn('pricePerDay').numFmt = CURRENCY_FORMAT;
    vehiclesSheet.getColumn('pricePerMonth').numFmt = CURRENCY_FORMAT;
    vehiclesSheet.getColumn('cost').numFmt = CURRENCY_FORMAT;
    const vehiclesTotalRow = vehiclesSheet.addRow({
      licensePlate: 'TOTAL',
      cost: detail.vehiclesTotalCost,
    });
    vehiclesTotalRow.font = { bold: true };
    vehiclesTotalRow.getCell('cost').numFmt = CURRENCY_FORMAT;

    if (!isService) {
      this.addCampaignOnlySheets(workbook, detail);
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName =
      detail.name
        .replace(/[^a-z0-9-_ ]/gi, '')
        .trim()
        .replace(/\s+/g, '_') || `${isService ? 'servicio' : 'campana'}-${campaignId}`;
    return { buffer, filename: `${safeName}.xlsx` };
  }

  /** Baqueanos, tracción a sangre, gastos extra y bitácora: solo existen en una campaña. */
  private addCampaignOnlySheets(workbook: ExcelJS.Workbook, detail: CampaignDetail): void {
    // ---- Hoja 4: Baqueanos asignados ----
    const guidesSheet = workbook.addWorksheet('Baqueanos asignados');
    guidesSheet.columns = [
      { header: 'Cantidad', key: 'quantity', width: 12 },
      { header: 'Desde', key: 'startDate', width: 14 },
      { header: 'Hasta', key: 'endDate', width: 14 },
      { header: 'Días', key: 'durationDays', width: 10 },
      { header: 'Precio/día', key: 'pricePerDay', width: 14 },
      { header: '% Impuestos', key: 'taxPercentage', width: 14 },
      { header: 'Precio manual', key: 'manual', width: 14 },
      { header: 'Costo total', key: 'cost', width: 16 },
      { header: 'Notas', key: 'notes', width: 30 },
    ];
    this.styleHeaderRow(guidesSheet.getRow(1));
    for (const g of detail.guides) {
      guidesSheet.addRow({
        quantity: g.quantity,
        startDate: g.startDate,
        endDate: g.endDate,
        durationDays: g.durationDays,
        pricePerDay: g.pricePerDay,
        taxPercentage: g.taxPercentage != null ? `${g.taxPercentage}%` : '',
        manual: g.manualCost != null ? 'Sí' : 'No',
        cost: g.cost,
        notes: g.notes ?? '',
      });
    }
    guidesSheet.getColumn('pricePerDay').numFmt = CURRENCY_FORMAT;
    guidesSheet.getColumn('cost').numFmt = CURRENCY_FORMAT;
    const guidesTotalRow = guidesSheet.addRow({ quantity: 'TOTAL', cost: detail.guidesTotalCost });
    guidesTotalRow.font = { bold: true };
    guidesTotalRow.getCell('cost').numFmt = CURRENCY_FORMAT;

    // ---- Hoja 5: Tracción a sangre asignada ----
    const packAnimalsSheet = workbook.addWorksheet('Tracción a sangre');
    packAnimalsSheet.columns = [
      { header: 'Tipo de animal', key: 'animalType', width: 20 },
      { header: 'Cantidad', key: 'quantity', width: 12 },
      { header: 'Desde', key: 'startDate', width: 14 },
      { header: 'Hasta', key: 'endDate', width: 14 },
      { header: 'Días', key: 'durationDays', width: 10 },
      { header: 'Precio/día', key: 'pricePerDay', width: 14 },
      { header: '% Impuestos', key: 'taxPercentage', width: 14 },
      { header: 'Precio manual', key: 'manual', width: 14 },
      { header: 'Costo total', key: 'cost', width: 16 },
      { header: 'Notas', key: 'notes', width: 30 },
    ];
    this.styleHeaderRow(packAnimalsSheet.getRow(1));
    for (const p of detail.packAnimals) {
      packAnimalsSheet.addRow({
        animalType: p.animalType,
        quantity: p.quantity,
        startDate: p.startDate,
        endDate: p.endDate,
        durationDays: p.durationDays,
        pricePerDay: p.pricePerDay,
        taxPercentage: p.taxPercentage != null ? `${p.taxPercentage}%` : '',
        manual: p.manualCost != null ? 'Sí' : 'No',
        cost: p.cost,
        notes: p.notes ?? '',
      });
    }
    packAnimalsSheet.getColumn('pricePerDay').numFmt = CURRENCY_FORMAT;
    packAnimalsSheet.getColumn('cost').numFmt = CURRENCY_FORMAT;
    const packAnimalsTotalRow = packAnimalsSheet.addRow({
      animalType: 'TOTAL',
      cost: detail.packAnimalsTotalCost,
    });
    packAnimalsTotalRow.font = { bold: true };
    packAnimalsTotalRow.getCell('cost').numFmt = CURRENCY_FORMAT;

    // ---- Hoja 6: Gastos extra ----
    const expensesSheet = workbook.addWorksheet('Gastos extra');
    expensesSheet.columns = [
      { header: 'Fecha', key: 'date', width: 14 },
      { header: 'Mes', key: 'month', width: 10 },
      { header: 'Descripción', key: 'description', width: 35 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Monto USD', key: 'amountUsd', width: 14 },
      { header: 'Monto ARS', key: 'amountArs', width: 14 },
      { header: 'N° de factura', key: 'invoiceNumber', width: 18 },
      { header: 'Tipo de factura', key: 'invoiceType', width: 16 },
      { header: 'Razón social', key: 'businessName', width: 25 },
      { header: 'Factura adjunta', key: 'hasInvoice', width: 16 },
    ];
    this.styleHeaderRow(expensesSheet.getRow(1));
    for (const e of detail.expenses) {
      expensesSheet.addRow({
        date: e.expenseDate,
        month: e.expenseDate.slice(0, 7),
        description: e.description,
        category: e.category ?? '',
        amountUsd: e.amountUsd ?? '',
        amountArs: e.amountArs ?? '',
        invoiceNumber: e.invoiceNumber ?? '',
        invoiceType: e.invoiceType ?? '',
        businessName: e.businessName ?? '',
        hasInvoice: e.invoiceUrl ? 'Sí' : 'No',
      });
    }
    expensesSheet.getColumn('amountUsd').numFmt = CURRENCY_FORMAT;
    expensesSheet.getColumn('amountArs').numFmt = CURRENCY_FORMAT;
    const expensesTotalRow = expensesSheet.addRow({
      description: 'TOTAL',
      amountUsd: detail.expensesTotal,
      amountArs: detail.expensesTotalArs,
    });
    expensesTotalRow.font = { bold: true };
    expensesTotalRow.getCell('amountUsd').numFmt = CURRENCY_FORMAT;
    expensesTotalRow.getCell('amountArs').numFmt = CURRENCY_FORMAT;

    // ---- Hoja 7: Actividades (ordenadas por fecha) ----
    const activitySheet = workbook.addWorksheet('Actividades');
    activitySheet.columns = [
      { header: 'Fecha', key: 'date', width: 14 },
      { header: 'Descripción', key: 'description', width: 60 },
      { header: 'Registrado por', key: 'author', width: 20 },
    ];
    this.styleHeaderRow(activitySheet.getRow(1));
    const sortedLogs = [...detail.activityLogs].sort((a, b) => a.logDate.localeCompare(b.logDate));
    for (const log of sortedLogs) {
      activitySheet.addRow({
        date: log.logDate,
        description: log.description,
        author: log.createdByUsername ?? '-',
      });
    }
    activitySheet.getColumn('description').alignment = { wrapText: true };
  }
}
