import { BadRequestException } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';

/**
 * Métricas calculadas a partir del propio recorrido, no leídas del archivo.
 * Se calculan acá y no en el frontend para que queden guardadas y sean
 * comparables entre trackings, venga el .kmz de la app que venga.
 *
 * Quedan afuera a propósito el "tiempo en movimiento" y la "velocidad en
 * movimiento": dependen de elegir un umbral arbitrario de detención, así que
 * no se calculan. Cuando el archivo los trae ya resueltos aparecen en
 * deviceInfo, sin que la aplicación se haga cargo del criterio.
 */
export interface TrackStats {
  /** Duración total entre la primera y la última marca de tiempo, en segundos. */
  durationSeconds: number | null;
  /** Longitud del recorrido en metros, sumando la distancia entre puntos consecutivos. */
  distanceMeters: number;
  /** Velocidad media en km/h: distancia sobre duración total. Null sin tiempos. */
  avgSpeedKmh: number | null;
  minAltitudeMeters: number | null;
  maxAltitudeMeters: number | null;
  /** Desnivel acumulado positivo y negativo, en metros. Null si el track no trae altitud. */
  elevationGainMeters: number | null;
  elevationLossMeters: number | null;
  /** Extremos del recorrido en ISO 8601, si el .kmz trae marcas de tiempo. */
  startedAt: string | null;
  endedAt: string | null;
}

export interface ParsedKmzTrack {
  /** [lat, lng] — invertido respecto de KML, que usa "lon,lat,alt". */
  points: [number, number][];
  /** Nombre del primer Placemark encontrado, si tiene uno; para sugerir un nombre en el form. */
  suggestedName: string | null;
  /** Métricas calculadas del recorrido. */
  stats: TrackStats;
  /**
   * Texto de la descripción del track tal como lo dejó la app que exportó el
   * .kmz, ya sin HTML. Ahí suelen venir datos que no se pueden calcular
   * (tiempo en movimiento, velocidad máxima, clima). Null si no trae ninguna.
   */
  deviceInfo: string | null;
}

/** Punto del recorrido con su altitud, cuando el archivo la incluye. */
type TrackPoint = { lat: number; lon: number; alt: number | null };

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  isArray: (name) => ['Placemark', 'LineString', 'coord', 'when'].includes(name),
});

const EARTH_RADIUS_METERS = 6371000;

/**
 * Umbral en metros por debajo del cual un cambio de altitud se considera ruido
 * del GPS y no suma al desnivel. Sin filtro, el desnivel acumulado de un track
 * largo se infla muchísimo. El valor exacto es una elección: cada aplicación
 * usa el suyo, así que este número puede diferir del que muestre la app que
 * generó el archivo.
 */
const ELEVATION_NOISE_THRESHOLD_METERS = 3;

/** "lon,lat[,alt] lon,lat[,alt] ..." (KML) -> puntos con altitud. */
function parseCoordinatesText(text: string): TrackPoint[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((triplet) => {
      const [lon, lat, alt] = triplet.split(',').map(Number);
      return { lat, lon, alt: Number.isFinite(alt) ? alt : null };
    })
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));
}

/** Junta las <coordinates> de todos los LineString que encuentre, sin importar cuán anidados
 * estén (Document/Folder/Placemark/MultiGeometry): un .kmz de trekking normalmente trae uno
 * solo, pero algunas apps parten el track en varios segmentos. */
function collectLineStrings(node: unknown, out: TrackPoint[][]): void {
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
 * Junta todos los <when> del documento, vengan de un gx:Track o de un
 * TimeStamp suelto. Solo interesan el primero y el último, así que no hace
 * falta emparejarlos con su coordenada.
 */
function collectTimestamps(node: unknown, out: string[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectTimestamps(item, out);
    return;
  }
  if (typeof node !== 'object' || node === null) return;

  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    // El tag puede venir con prefijo de namespace según el exportador.
    if (key === 'when' || key.endsWith(':when')) {
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        if (typeof v === 'string' && v.trim()) out.push(v.trim());
        else if (typeof v === 'number') out.push(String(v));
      }
      continue;
    }
    if (typeof value === 'object' && value !== null) collectTimestamps(value, out);
  }
}

/** Convierte el HTML que las apps meten en <description> a texto plano legible. */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/\s*(p|tr|div|h\d)\s*>/gi, '\n')
    .replace(/<\/\s*td\s*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\]\]>/g, '')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

/**
 * Junta el texto de todas las <description> del documento, en el orden en que
 * aparecen. No alcanza con mirar el Placemark del track: OruxMaps, por
 * ejemplo, deja la tabla de estadísticas en el <description> del Document y
 * el del Placemark vacío, y el clima en los marcadores de inicio y fin.
 */
function collectDescriptions(node: unknown, out: string[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectDescriptions(item, out);
    return;
  }
  if (typeof node !== 'object' || node === null) return;

  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key === 'description' && value != null && typeof value !== 'object') {
      const text = htmlToPlainText(String(value));
      if (text) out.push(text);
      continue;
    }
    if (typeof value === 'object' && value !== null) collectDescriptions(value, out);
  }
}

/**
 * Normaliza las descripciones a una sola lista de líneas sin repetidos.
 *
 * Hace falta porque el mismo bloque de estadísticas suele venir más de una vez
 * en el archivo (una por el track completo y otra por cada segmento), con
 * valores apenas distintos. Se conserva el primer valor de cada etiqueta
 * "Etiqueta: valor" y se descartan las repeticiones posteriores; las líneas
 * sin etiqueta (por ejemplo "Muy nuboso") se deduplican por texto completo.
 */
function dedupeDescriptionLines(descriptions: string[]): string | null {
  const seenLabels = new Set<string>();
  const seenLines = new Set<string>();
  const lines: string[] = [];

  for (const line of descriptions.flatMap((text) => text.split('\n'))) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const separator = trimmed.indexOf(':');
    const label = separator > 0 ? trimmed.slice(0, separator).trim().toLowerCase() : null;

    if (label) {
      if (seenLabels.has(label)) continue;
      seenLabels.add(label);
    } else {
      if (seenLines.has(trimmed)) continue;
      seenLines.add(trimmed);
    }
    lines.push(trimmed);
  }

  return lines.length ? lines.join('\n') : null;
}

/** Distancia en metros entre dos puntos sobre la superficie terrestre. */
function haversineMeters(a: TrackPoint, b: TrackPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLat = lat2 - lat1;
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

function computeStats(points: TrackPoint[], timestamps: string[]): TrackStats {
  let distanceMeters = 0;
  for (let i = 1; i < points.length; i++) {
    distanceMeters += haversineMeters(points[i - 1], points[i]);
  }

  const altitudes = points
    .map((p) => p.alt)
    .filter((alt): alt is number => alt !== null && Number.isFinite(alt));

  let elevationGainMeters: number | null = null;
  let elevationLossMeters: number | null = null;
  if (altitudes.length >= 2) {
    let gain = 0;
    let loss = 0;
    let reference = altitudes[0];
    for (const altitude of altitudes.slice(1)) {
      const delta = altitude - reference;
      if (Math.abs(delta) >= ELEVATION_NOISE_THRESHOLD_METERS) {
        if (delta > 0) gain += delta;
        else loss += -delta;
        reference = altitude;
      }
    }
    elevationGainMeters = Math.round(gain);
    elevationLossMeters = Math.round(loss);
  }

  // Las marcas de tiempo se ordenan porque algunos exportadores parten el
  // track en segmentos y no garantizan que vengan en orden cronológico.
  const times = timestamps
    .map((value) => Date.parse(value))
    .filter((ms) => Number.isFinite(ms))
    .sort((a, b) => a - b);

  const startedAtMs = times.length >= 2 ? times[0] : null;
  const endedAtMs = times.length >= 2 ? times[times.length - 1] : null;
  const durationSeconds =
    startedAtMs !== null && endedAtMs !== null ? Math.round((endedAtMs - startedAtMs) / 1000) : null;

  const avgSpeedKmh =
    durationSeconds && durationSeconds > 0
      ? Number(((distanceMeters / durationSeconds) * 3.6).toFixed(2))
      : null;

  return {
    durationSeconds,
    distanceMeters: Math.round(distanceMeters),
    avgSpeedKmh,
    minAltitudeMeters: altitudes.length ? Math.round(Math.min(...altitudes)) : null,
    maxAltitudeMeters: altitudes.length ? Math.round(Math.max(...altitudes)) : null,
    elevationGainMeters,
    elevationLossMeters,
    startedAt: startedAtMs !== null ? new Date(startedAtMs).toISOString() : null,
    endedAt: endedAtMs !== null ? new Date(endedAtMs).toISOString() : null,
  };
}

/**
 * Descomprime un .kmz (zip) en memoria, busca el .kml que tiene adentro y
 * extrae la(s) línea(s) de tracking como una única polilínea (todos los
 * segmentos encontrados, concatenados en orden), junto con las métricas del
 * recorrido y la descripción que haya dejado la app exportadora. Tira
 * BadRequestException con un mensaje entendible si el archivo no es un .kmz
 * válido o no trae ninguna línea.
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

  const segments: TrackPoint[][] = [];
  collectLineStrings(parsed, segments);
  if (segments.length === 0) {
    throw new BadRequestException('El .kmz no contiene ninguna línea (LineString) para mostrar.');
  }

  const trackPoints = segments.flat();
  const timestamps: string[] = [];
  collectTimestamps(parsed, timestamps);

  const descriptions: string[] = [];
  collectDescriptions(parsed, descriptions);

  return {
    points: trackPoints.map((p) => [p.lat, p.lon] as [number, number]),
    suggestedName: findFirstPlacemarkName(parsed),
    stats: computeStats(trackPoints, timestamps),
    deviceInfo: dedupeDescriptionLines(descriptions),
  };
}
