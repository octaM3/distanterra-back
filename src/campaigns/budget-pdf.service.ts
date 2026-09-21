import { Injectable, Logger } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import PDFDocument from 'pdfkit';
import { CampaignsService } from './campaigns.service';
import { CampaignDetail } from './campaigns.types';
import { daysBetweenInclusive } from './campaigns.util';

/**
 * Datos del emisor. Están acá y no en la base porque son de la empresa, no de
 * cada presupuesto: cambian una vez cada varios años y no justifican una
 * pantalla para editarlos.
 */
const ISSUER = {
  addressLine: 'Los Goicos 2465',
  cityLine: 'Malargüe, Mendoza',
  phone: '+54 9 2614692408',
};

/** Naranja de marca (--color-orange en el front) y grises del documento. */
const COLORS = {
  brand: '#F97316',
  ink: '#1F2937',
  soft: '#6B7280',
  line: '#E5E7EB',
  zebra: '#F9FAFB',
  white: '#FFFFFF',
};

const PAGE_MARGIN = 42;
/** Ancho de una hoja A4 vertical en puntos. */
const PAGE_WIDTH = 595.28;
/** Alto de la banda de color que cruza el documento arriba de todo. */
const TOP_BAND_HEIGHT = 10;
/** Altura a partir de la cual una fila se manda a la página siguiente. */
const PAGE_BREAK_Y = 760;

interface BudgetLine {
  /** Mes al que corresponde la línea, en mayúsculas ("SEPTIEMBRE"). */
  month: string;
  category: string;
  description: string;
  amount: number;
  /**
   * El importe ya trae impuesto adentro (baqueanos y animales lo cargan por
   * asignación), así que no vuelve a entrar en la base del IVA general.
   */
  taxIncluded: boolean;
}

const MONTH_NAMES = [
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE',
];

/** "2026-09-30" -> "SEPTIEMBRE". */
const monthNameOf = (date: string): string => MONTH_NAMES[parseInt(date.slice(5, 7), 10) - 1] ?? '';

/** "2026-09-30" -> "30/09/2026". */
const formatDate = (date: string): string => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

/** 1470 -> "USD$ 1.470": sin decimales, como en los presupuestos que se venían mandando. */
const formatMoney = (amount: number): string =>
  `USD$ ${Math.round(amount).toLocaleString('es-AR')}`;

/** 7 -> "7 días", 1 -> "1 día". Las descripciones las lee el cliente, no un sistema. */
const formatDays = (days: number): string => `${days} ${days === 1 ? 'día' : 'días'}`;

/**
 * El presupuesto que se le manda a la empresa, en PDF.
 *
 * Las líneas salen de las mismas asignaciones que la campaña, sin números
 * paralelos: lo que se presupuesta es exactamente lo que después se ejecuta.
 * La descripción de cada línea sale de las notas de la asignación cuando las
 * tiene —ahí es donde se escribe lo que el cliente necesita leer, "traslado de
 * personal con conductor profesional"— y si no, se arma una con el recurso y
 * la cantidad de días.
 */
@Injectable()
export class BudgetPdfService {
  private readonly logger = new Logger(BudgetPdfService.name);

  constructor(private readonly campaignsService: CampaignsService) {}

  private get contentWidth(): number {
    return PAGE_WIDTH - PAGE_MARGIN * 2;
  }

  /** Anchos de las cuatro columnas; suman el ancho útil de la hoja. */
  private get columns(): { month: number; category: number; description: number; amount: number } {
    return { month: 78, category: 96, description: 245, amount: 92 };
  }

  /**
   * El logo se busca en dist/assets (build) y en assets/ (ts-node en
   * desarrollo). Si no está, el PDF sale igual con el nombre en texto: un
   * presupuesto sin logo se puede mandar, uno que no se generó no.
   */
  private resolveLogoPath(): string | null {
    const candidates = [
      join(__dirname, '..', '..', 'assets', 'distanterra-logo.png'),
      join(process.cwd(), 'assets', 'distanterra-logo.png'),
    ];
    return candidates.find((path) => existsSync(path)) ?? null;
  }

  private buildLines(detail: CampaignDetail): BudgetLine[] {
    const lines: BudgetLine[] = [];

    for (const item of detail.stockItems) {
      lines.push({
        month: monthNameOf(item.startDate),
        category: item.category,
        description:
          item.notes ??
          `${formatDays(item.durationDays)} de ${item.stockItemName}${
            item.quantity > 1 ? ` x${item.quantity}` : ''
          }`,
        amount: item.cost,
        taxIncluded: false,
      });
    }

    for (const vehicle of detail.vehicles) {
      lines.push({
        month: monthNameOf(vehicle.startDate),
        category: 'Vehículo',
        description:
          vehicle.notes ??
          `${formatDays(vehicle.durationDays)} de alquiler ${
            vehicle.vehicleDescription ?? vehicle.licensePlate
          }`,
        amount: vehicle.cost,
        taxIncluded: false,
      });
    }

    for (const guide of detail.guides) {
      lines.push({
        month: monthNameOf(guide.startDate),
        category: 'Baqueanos',
        description:
          guide.notes ??
          `${guide.quantity} ${guide.quantity === 1 ? 'baqueano' : 'baqueanos'} por ${formatDays(
            guide.durationDays,
          )}`,
        amount: guide.cost,
        taxIncluded: guide.taxPercentage !== null && guide.taxPercentage > 0,
      });
    }

    for (const animal of detail.packAnimals) {
      lines.push({
        month: monthNameOf(animal.startDate),
        category: 'Animales de carga',
        description:
          animal.notes ??
          `${animal.quantity} ${animal.animalType} por ${formatDays(animal.durationDays)}`,
        amount: animal.cost,
        taxIncluded: animal.taxPercentage !== null && animal.taxPercentage > 0,
      });
    }

    // Solo los gastos en dólares: el presupuesto es en USD de punta a punta y
    // no hay tipo de cambio con el que sumar los que están en pesos.
    for (const expense of detail.expenses) {
      if (expense.amountUsd === null || expense.amountUsd === 0) continue;
      lines.push({
        month: monthNameOf(expense.expenseDate),
        category: expense.category ?? 'Gastos',
        description: expense.description,
        amount: expense.amountUsd,
        taxIncluded: false,
      });
    }

    return lines;
  }

  async buildPdf(campaignId: number): Promise<{ buffer: Buffer; filename: string }> {
    const detail = await this.campaignsService.getDetail(campaignId);
    this.logger.log(`Generando PDF de presupuesto id=${campaignId}: "${detail.name}"`);

    const lines = this.buildLines(detail);
    const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
    // El IVA general no se aplica sobre lo que ya viene con impuesto propio,
    // para no cobrarlo dos veces sobre la misma línea.
    const taxableBase = lines
      .filter((line) => !line.taxIncluded)
      .reduce((sum, line) => sum + line.amount, 0);
    const taxRate = detail.taxPercentage ?? 0;
    const taxAmount = (taxableBase * taxRate) / 100;
    const total = subtotal + taxAmount;

    const doc = new PDFDocument({
      size: 'A4',
      margin: PAGE_MARGIN,
      info: { Title: `Presupuesto ${detail.name}`, Author: 'Distanterra' },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    const done = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    this.drawHeader(doc, detail);
    this.drawTable(doc, lines);
    this.drawTotals(doc, { subtotal, taxRate, taxAmount, total });
    this.drawFooter(doc, detail);

    doc.end();
    const buffer = await done;

    const safeName = detail.name.replace(/[^\w\dáéíóúñÁÉÍÓÚÑ -]/g, '').trim() || 'presupuesto';
    return { buffer, filename: `Presupuesto - ${safeName}.pdf` };
  }

  private drawHeader(doc: PDFKit.PDFDocument, detail: CampaignDetail): void {
    // Banda de color al tope de la hoja, de borde a borde.
    doc.rect(0, 0, PAGE_WIDTH, TOP_BAND_HEIGHT).fill(COLORS.brand);

    const top = PAGE_MARGIN + 6;
    const logoPath = this.resolveLogoPath();
    if (logoPath) {
      doc.image(logoPath, PAGE_MARGIN, top, { fit: [150, 58] });
    } else {
      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor(COLORS.brand)
        .text('DISTANTERRA', PAGE_MARGIN, top);
    }

    // Datos del emisor, a la derecha y a la altura del logo.
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.soft);
    const issuerTop = top + 6;
    doc.text(ISSUER.addressLine, PAGE_MARGIN, issuerTop, {
      width: this.contentWidth,
      align: 'right',
    });
    doc.text(ISSUER.cityLine, { width: this.contentWidth, align: 'right' });
    doc.text(ISSUER.phone, { width: this.contentWidth, align: 'right' });

    doc.font('Helvetica-Bold').fontSize(19).fillColor(COLORS.ink);
    doc.text(`Presupuesto ${detail.name}`, PAGE_MARGIN, top + 74, { width: this.contentWidth });

    doc.moveDown(0.35);
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLORS.brand);
    const days = daysBetweenInclusive(detail.startDate, detail.endDate);
    doc.text(
      `Desde ${formatDate(detail.startDate)} hasta ${formatDate(detail.endDate)}  ·  ${days} días`,
      { width: this.contentWidth },
    );

    // Para quién es y desde cuándo. En el formato anterior el cliente solo
    // aparecía metido adentro del título.
    doc.moveDown(0.9);
    const infoTop = doc.y;
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.soft);
    doc.text('PARA', PAGE_MARGIN, infoTop);
    doc.text('EMITIDO', PAGE_MARGIN, infoTop, { width: this.contentWidth, align: 'right' });

    doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.ink);
    doc.text(detail.companyName, PAGE_MARGIN, infoTop + 11, {
      width: this.contentWidth / 2,
    });
    doc.text(formatDate(new Date().toISOString().slice(0, 10)), PAGE_MARGIN, infoTop + 11, {
      width: this.contentWidth,
      align: 'right',
    });

    if (detail.location) {
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.soft);
      doc.text(detail.location, PAGE_MARGIN, infoTop + 27, { width: this.contentWidth });
    }

    doc.y = infoTop + (detail.location ? 48 : 38);
  }

  private drawTableHead(doc: PDFKit.PDFDocument): void {
    const { month, category, description, amount } = this.columns;
    const y = doc.y;

    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.brand);
    let x = PAGE_MARGIN;
    doc.text('MES', x, y, { width: month });
    x += month;
    doc.text('CATEGORÍA', x, y, { width: category });
    x += category;
    doc.text('DESCRIPCIÓN', x, y, { width: description });
    x += description;
    doc.text('IMPORTE', x, y, { width: amount, align: 'right' });

    const lineY = y + 13;
    doc
      .moveTo(PAGE_MARGIN, lineY)
      .lineTo(PAGE_MARGIN + this.contentWidth, lineY)
      .lineWidth(1)
      .strokeColor(COLORS.brand)
      .stroke();

    doc.y = lineY + 7;
  }

  private drawTable(doc: PDFKit.PDFDocument, lines: BudgetLine[]): void {
    this.drawTableHead(doc);

    const { month, category, description, amount } = this.columns;
    let previousMonth: string | null = null;
    let zebra = false;

    for (const line of lines) {
      const descriptionHeight = doc
        .font('Helvetica')
        .fontSize(9)
        .heightOfString(line.description, { width: description - 8 });
      const rowHeight = Math.max(descriptionHeight, 12) + 10;

      // Salto de página con el encabezado repetido, para que una tabla larga
      // no pierda los títulos de columna.
      if (doc.y + rowHeight > PAGE_BREAK_Y) {
        doc.addPage();
        doc.y = PAGE_MARGIN;
        this.drawTableHead(doc);
        previousMonth = null;
      }

      const y = doc.y;
      if (zebra) {
        doc.rect(PAGE_MARGIN - 4, y - 4, this.contentWidth + 8, rowHeight).fill(COLORS.zebra);
      }
      zebra = !zebra;

      let x = PAGE_MARGIN;
      // El mes se escribe una sola vez por grupo: repetirlo en cada fila
      // ensucia la columna sin agregar nada.
      if (line.month !== previousMonth) {
        doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.ink);
        doc.text(line.month, x, y, { width: month });
        previousMonth = line.month;
      }

      x += month;
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.soft);
      doc.text(line.category, x, y, { width: category - 8 });

      x += category;
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.ink);
      doc.text(line.description, x, y, { width: description - 8 });

      x += description;
      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.ink);
      doc.text(formatMoney(line.amount), x, y, { width: amount, align: 'right' });

      doc.y = y + rowHeight;
    }

    doc
      .moveTo(PAGE_MARGIN, doc.y)
      .lineTo(PAGE_MARGIN + this.contentWidth, doc.y)
      .lineWidth(0.5)
      .strokeColor(COLORS.line)
      .stroke();
    doc.y += 12;
  }

  /**
   * Subtotal, IVA y total como bloque aparte, alineado a la derecha. En el
   * formato anterior el IVA era una fila más de la tabla, al mismo nivel que
   * una camioneta, y el total no colgaba de ningún subtotal.
   */
  private drawTotals(
    doc: PDFKit.PDFDocument,
    totals: { subtotal: number; taxRate: number; taxAmount: number; total: number },
  ): void {
    const boxWidth = 250;
    const boxLeft = PAGE_MARGIN + this.contentWidth - boxWidth;
    const valueWidth = 110;

    const addRow = (label: string, value: string) => {
      const y = doc.y;
      doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.soft);
      doc.text(label, boxLeft, y, { width: boxWidth - valueWidth });
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLORS.ink);
      doc.text(value, boxLeft + boxWidth - valueWidth, y, { width: valueWidth, align: 'right' });
      doc.y = y + 16;
    };

    addRow('Subtotal', formatMoney(totals.subtotal));
    if (totals.taxRate > 0) {
      addRow(`IVA ${totals.taxRate}%`, formatMoney(totals.taxAmount));
    }

    // Franja del total: el único bloque en color fuerte de la hoja, para que
    // sea lo primero que se encuentre al mirarla.
    doc.y += 4;
    const bandTop = doc.y;
    doc.rect(boxLeft, bandTop, boxWidth, 30).fill(COLORS.brand);
    doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.white);
    doc.text('TOTAL', boxLeft + 12, bandTop + 9, { width: 80 });
    doc.text(formatMoney(totals.total), boxLeft + 12, bandTop + 9, {
      width: boxWidth - 24,
      align: 'right',
    });
    doc.y = bandTop + 46;
  }

  private drawFooter(doc: PDFKit.PDFDocument, detail: CampaignDetail): void {
    if (detail.description) {
      doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.soft);
      doc.text('OBSERVACIONES', PAGE_MARGIN, doc.y, { width: this.contentWidth });
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.ink);
      doc.text(detail.description, { width: this.contentWidth });
      doc.moveDown(1);
    }

    doc.font('Helvetica').fontSize(8).fillColor(COLORS.soft);
    doc.text('Valores expresados en dólares estadounidenses (USD).', PAGE_MARGIN, doc.y, {
      width: this.contentWidth,
    });
  }
}
