import { Injectable, Logger } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { CampaignsService } from './campaigns.service';
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

  constructor(private readonly campaignsService: CampaignsService) {}

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

    // ---- Hoja 1: Resumen ----
    const summarySheet = workbook.addWorksheet('Resumen');
    summarySheet.columns = [
      { key: 'label', width: 32 },
      { key: 'value', width: 40 },
    ];
    summarySheet.addRows([
      { label: 'Campaña', value: detail.name },
      { label: 'Empresa', value: detail.companyName },
      { label: 'Ubicación', value: detail.location ?? '-' },
      { label: 'Estado', value: campaignStatusLabel(detail.status) },
      { label: 'Fecha de inicio', value: detail.startDate },
      { label: 'Fecha de fin', value: detail.endDate },
      { label: 'Duración', value: `${detail.durationDays} día(s)` },
      {
        label: 'Finalizada el',
        value: detail.finishedAt ? new Date(detail.finishedAt).toLocaleString('es-AR') : '-',
      },
      { label: '', value: '' },
      { label: 'Total stock asignado', value: detail.stockItemsTotalCost },
      { label: 'Total vehículos asignados', value: detail.vehiclesTotalCost },
      { label: 'Total gastos extra', value: detail.expensesTotal },
      { label: 'TOTAL GENERAL', value: detail.grandTotal },
    ]);
    summarySheet.getColumn('value').numFmt = CURRENCY_FORMAT;
    ['B10', 'B11', 'B12', 'B13'].forEach((ref) => {
      summarySheet.getCell(ref).numFmt = CURRENCY_FORMAT;
    });
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(13).font = { bold: true };

    if (detail.expensesByMonth.length > 0) {
      summarySheet.addRow({});
      summarySheet.addRow({ label: 'Gastos por mes', value: '' });
      summarySheet.getRow(summarySheet.lastRow!.number).font = { bold: true };
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

    // ---- Hoja 4: Gastos extra ----
    const expensesSheet = workbook.addWorksheet('Gastos extra');
    expensesSheet.columns = [
      { header: 'Fecha', key: 'date', width: 14 },
      { header: 'Mes', key: 'month', width: 10 },
      { header: 'Descripción', key: 'description', width: 35 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Monto', key: 'amount', width: 16 },
      { header: 'Factura adjunta', key: 'hasInvoice', width: 16 },
    ];
    this.styleHeaderRow(expensesSheet.getRow(1));
    for (const e of detail.expenses) {
      expensesSheet.addRow({
        date: e.expenseDate,
        month: e.expenseDate.slice(0, 7),
        description: e.description,
        category: e.category ?? '',
        amount: e.amount,
        hasInvoice: e.invoiceUrl ? 'Sí' : 'No',
      });
    }
    expensesSheet.getColumn('amount').numFmt = CURRENCY_FORMAT;
    const expensesTotalRow = expensesSheet.addRow({
      description: 'TOTAL',
      amount: detail.expensesTotal,
    });
    expensesTotalRow.font = { bold: true };
    expensesTotalRow.getCell('amount').numFmt = CURRENCY_FORMAT;

    // ---- Hoja 5: Actividades (ordenadas por fecha) ----
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

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName =
      detail.name
        .replace(/[^a-z0-9-_ ]/gi, '')
        .trim()
        .replace(/\s+/g, '_') || `campana-${campaignId}`;
    return { buffer, filename: `${safeName}.xlsx` };
  }
}
