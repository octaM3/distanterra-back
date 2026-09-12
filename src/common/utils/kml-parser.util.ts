import { BadRequestException } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';

export interface ParsedKmzTrack {
  /** [lat, lng] — invertido respecto de KML, que usa "lon,lat,alt". */
  points: [number, number][];
  /** Nombre del primer Placemark encontrado, si tiene uno; para sugerir un nombre en el form. */
  suggestedName: string | null;
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  isArray: (name) => ['Placemark', 'LineString', 'coord', 'when'].includes(name),
});

/** "lon,lat[,alt] lon,lat[,alt] ..." (KML) -> [[lat, lng], ...] (Leaflet). */
function parseCoordinatesText(text: string): [number, number][] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((triplet) => {
      const [lon, lat] = triplet.split(',').map(Number);
      return [lat, lon] as [number, number];
    })
    .filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon));
}

/** Junta las <coordinates> de todos los LineString que encuentre, sin importar cuán anidados
 * estén (Document/Folder/Placemark/MultiGeometry): un .kmz de trekking normalmente trae uno
 * solo, pero algunas apps parten el track en varios segmentos. */
function collectLineStrings(node: unknown, out: [number, number][][]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectLineStrings(item, out);
    return;
  }
  if (typeof node !== 'object' || node === null) return;

  const obj = node as Record<string, unknown>;
  if ('LineString' in obj) {
    const lineStrings = Array.isArray(obj.LineString) ? obj.LineString : [obj.LineString];
    for (const ls of lineStrings) {
      const coords = (ls as Record<string, unknown>)?.coordinates;
      if (typeof coords === 'string') {
        const points = parseCoordinatesText(coords);
        if (points.length >= 2) out.push(points);
      }
    }
  }
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) collectLineStrings(value, out);
  }
}

function findFirstPlacemarkName(node: unknown): string | null {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findFirstPlacemarkName(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof node !== 'object' || node === null) return null;

  const obj = node as Record<string, unknown>;
  if (typeof obj.name === 'string' && obj.name.trim()) return obj.name.trim();
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      const found = findFirstPlacemarkName(value);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Descomprime un .kmz (zip) en memoria, busca el .kml que tiene adentro y
 * extrae la(s) línea(s) de tracking como una única polilínea (todos los
 * segmentos encontrados, concatenados en orden). Tira BadRequestException
 * con un mensaje entendible si el archivo no es un .kmz válido o no trae
 * ninguna línea.
 */
export function parseKmzTrack(buffer: Buffer): ParsedKmzTrack {
  let zip: AdmZip;
  try {
    zip = new AdmZip(buffer);
  } catch {
    throw new BadRequestException('El archivo no es un .kmz válido (no se pudo descomprimir).');
  }

  const kmlEntry = zip.getEntries().find((e) => e.entryName.toLowerCase().endsWith('.kml'));
  if (!kmlEntry) {
    throw new BadRequestException('El .kmz no contiene ningún archivo .kml adentro.');
  }

  let parsed: unknown;
  try {
    parsed = xmlParser.parse(kmlEntry.getData().toString('utf-8'));
  } catch {
    throw new BadRequestException('No se pudo leer el .kml dentro del .kmz (XML inválido).');
  }

  const segments: [number, number][][] = [];
  collectLineStrings(parsed, segments);
  if (segments.length === 0) {
    throw new BadRequestException('El .kmz no contiene ninguna línea (LineString) para mostrar.');
  }

  return {
    points: segments.flat(),
    suggestedName: findFirstPlacemarkName(parsed),
  };
}
