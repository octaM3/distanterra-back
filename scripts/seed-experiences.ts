/**
 * Migración única: carga la tabla "experiences" con el historial de proyectos
 * que anteriormente estaba hardcodeado en distanterra-front/src/i18n.ts
 * (landing.experiencia.contenido), ahora traducido al formato de bloques
 * dinámicos texto/lista utilizado por la API administrable.
 *
 * Es seguro ejecutarlo más de una vez: elimina la fila anterior con el mismo
 * title_es antes de reinsertar, por lo que no genera duplicados.
 *
 * Uso:
 *   npm run db:seed-experiences
 */
import 'dotenv/config';
import { Client } from 'pg';

type Block = { type: 'text'; content: string } | { type: 'list'; items: string[] };

interface SeedExperience {
  titleEs: string;
  titleEn: string;
  locationEs: string | null;
  locationEn: string | null;
  descriptionEs: Block[];
  descriptionEn: Block[];
  displayOrder: number;
}

const text = (content: string): Block => ({ type: 'text', content });
const list = (items: string[]): Block => ({ type: 'list', items });

const experiences: SeedExperience[] = [
  {
    titleEs: 'CHD 4X4 Garage / 1993-1999',
    titleEn: 'CHD 4X4 Garage / 1993-1999',
    locationEs: null,
    locationEn: null,
    descriptionEs: [
      text(
        'Taller Mecánico especializado en equipamiento para vehículos mineros y actividades de campo.',
      ),
      text(
        'Clientes: CRA Exploration, RTZ Mining, MIM, Grupo Minero Aconcagua, Minera Antofalla, Andes Degerstrom, Rio Tinto, CyM Servicios Topográficos.',
      ),
    ],
    descriptionEn: [
      text(
        'Mechanical workshop specialized in equipment for mining vehicles and field activities.',
      ),
      text(
        'Clients: CRA Exploration, RTZ Mining, MIM, Grupo Minero Aconcagua, Minera Antofalla, Andes Degerstrom, Rio Tinto, CyM Servicios Topográficos.',
      ),
    ],
    displayOrder: 0,
  },
  {
    titleEs: 'MIM EX / 2000',
    titleEn: 'MIM EX / 2000',
    locationEs: 'Farallón Negro y Minera Alumbrera, Catamarca',
    locationEn: 'Farallón Negro and Minera Alumbrera, Catamarca',
    descriptionEs: [
      text('Armado y fabricación de equipo de transporte MIM DAS para exploraciones geofísicas.'),
      text(
        'Asistencia técnica en estudios geofisicos de Resistividad, equipamiento de vehículos, trailer, coordinación con baqueanos, armado y mantenimiento de generadores. Intérprete inglés.',
      ),
    ],
    descriptionEn: [
      text(
        'Assembly and manufacturing of MIM DAS transport equipment for geophysical explorations.',
      ),
      text(
        'Technical assistance in resistivity geophysical studies, vehicle equipment, trailers, coordination with local guides, assembly and maintenance of generators. English interpreter.',
      ),
    ],
    displayOrder: 1,
  },
  {
    titleEs: 'Aquiline Resources / 2005 - 2008',
    titleEn: 'Aquiline Resources / 2005 - 2008',
    locationEs: 'Calcatreu, Rio Negro',
    locationEn: 'Calcatreu, Rio Negro',
    descriptionEs: [
      text(
        'Traslado de muestras minerales desde Ing. Jacobacci hasta ALS Mendoza (total: 15.000 metros de muestras) y transporte de personal, provisión de insumos de exploración. Intérprete inglés.',
      ),
    ],
    descriptionEn: [
      text(
        'Transportation of mineral samples from Ing. Jacobacci to ALS Mendoza (total: 15,000 meters of samples) and transport of personnel, provision of exploration supplies. English interpreter.',
      ),
    ],
    displayOrder: 2,
  },
  {
    titleEs: 'Vale do Rio Doce / 2014',
    titleEn: 'Vale do Rio Doce / 2014',
    locationEs: 'La Flecha, La Rioja',
    locationEn: 'La Flecha, La Rioja',
    descriptionEs: [text('Traslado de Muestras hasta Laboratorio ALS Mendoza.')],
    descriptionEn: [text('Transportation of Samples to the Laboratory ALS Mendoza.')],
    displayOrder: 3,
  },
  {
    titleEs: 'Meryllion Resources / 2012 - 2013 - 2014 - 2015',
    titleEn: 'Meryllion Resources / 2012 - 2013 - 2014 - 2015',
    locationEs: 'Cerro Amarillo, Malargüe, Mendoza',
    locationEn: 'Cerro Amarillo, Malargüe, Mendoza',
    descriptionEs: [
      text(
        'Coordinación de cabalgatas, transporte de muestras y personal, almacenaje, reparaciones y mantenimiento de equipos de campo, supervisión y mantenimiento de vehículos afectados al proyecto, coordinación de servicios de geodesia, coordinación de traslados en helicóptero, provisión de insumos de exploración y mercadería. Intérprete inglés.',
      ),
    ],
    descriptionEn: [
      text(
        'Coordination of horseback riding, transportation of samples and personnel, storage, repairs and maintenance of field equipment, supervision and maintenance of vehicles assigned to the project, coordination of geodesy services, coordination of helicopter transfers, provision of exploration supplies and merchandise. English interpreter.',
      ),
    ],
    displayOrder: 4,
  },
  {
    titleEs: 'Mirasol Resources / 2011 - 2012 - 2016 - 2017',
    titleEn: 'Mirasol Resources / 2011 - 2012 - 2016 - 2017',
    locationEs:
      'Altazor, Chile (Calama, Taltal, Antofagasta, Copiapó y Paso Sico), Laguna Blanca y Cerro Chato, Santa Cruz',
    locationEn:
      'Altazor, Chile (Calama, Taltal, Antofagasta, Copiapó and Paso Sico), Laguna Blanca and Cerro Chato, Santa Cruz',
    descriptionEs: [
      text(
        'Organización de campamento, transporte de muestras y personal, provisión de insumos, armado de logueras, supervisión de vehículos y equipos de campo. Intérprete inglés.',
      ),
    ],
    descriptionEn: [
      text(
        'Organization of camp, transportation of samples and personnel, provision of supplies, assembly of logging equipment, supervision of vehicles and field equipment. English interpreter.',
      ),
    ],
    displayOrder: 5,
  },
  {
    titleEs: 'AngloGold Ashanti / 2020',
    titleEn: 'AngloGold Ashanti / 2020',
    locationEs: null,
    locationEn: null,
    descriptionEs: [text('Organización y cierre en depósito de muestras.')],
    descriptionEn: [text('Organization and closure of sample storage.')],
    displayOrder: 6,
  },
  {
    titleEs: 'Geoenergia SA / 2022 - 2023',
    titleEn: 'Geoenergia SA / 2022 - 2023',
    locationEs:
      'Organullo, Salta (San Antonio de los Cobres), Cementos Avellaneda, Buenos Aires (Olavarría)',
    locationEn:
      'Organullo, Salta (San Antonio de los Cobres), Cementos Avellaneda, Buenos Aires (Olavarría)',
    descriptionEs: [
      text(
        'Scouting para magnetometría con helicóptero, logística y supervisión en armado de barreras preventivas por desprendimientos de roca (GEOBRUGG).',
      ),
    ],
    descriptionEn: [
      text(
        'Scouting for magnetometry with helicopter, logistics and supervision in the assembly of preventive barriers against rockfalls (GEOBRUGG).',
      ),
    ],
    displayOrder: 7,
  },
  {
    titleEs: 'First Quantum / 2023 - 2024',
    titleEn: 'First Quantum / 2023 - 2024',
    locationEs: 'Malargüe, Mendoza',
    locationEn: 'Malargüe, Mendoza',
    descriptionEs: [
      text(
        'Scouting, provisión de insumos, traslado de vehículos, reservas de alojamiento, coordinación de cabalgatas, baqueanos y superficiarios.',
      ),
    ],
    descriptionEn: [
      text(
        'Scouting, provision of supplies, vehicle transport, accommodation bookings, coordination of horseback riding, local guides, and surface workers.',
      ),
    ],
    displayOrder: 8,
  },
  {
    titleEs: 'Trabajos eventuales / 2000 - Actualidad',
    titleEn: 'Temporary jobs / 2000 - Present',
    locationEs: null,
    locationEn: null,
    descriptionEs: [
      text(
        'Logística para: Universidad de Hawaii / UNCuyo / INPRES / IGN / UNAVCO / Ohio State University / USGS / Universidad de Toronto / Universidad de Tarija / Universidad de Main / Universidad de La Plata / UBA / USL / Universidad de Texas.',
      ),
      text(
        'Transporte, asistencia y logística en campañas universitarias geológicas. Intérprete italiano e inglés.',
      ),
      text(
        'Proyecto SIGMA - Mauna / Aconcagua (Chile, Mendoza, Neuquén, La Pampa, Jocolí, San Juan)',
      ),
      text(
        'Fabricación e instalación de estaciones con equipos GPS para estudios tectónicos del Programa RapidResponse (sismo de Maule, Chile) y fabricación e instalación de estaciones GPS en zonas de influencia en territorio argentino.',
      ),
      list([
        'Logística en estudios de abanicos aluviales en secano de Lavalle, Mendoza.',
        'Instalación de Sensores Sísmicos Complejo volcánico Caviahue Copahue.',
        'Asistencia Logística Visita área volcánica Payunia, Malargüe, Mendoza.',
      ]),
    ],
    descriptionEn: [
      text(
        'Logistics for: University of Hawaii / UNCuyo / INPRES / IGN / UNAVCO / Ohio State University / USGS / University of Toronto / University of Tarija / University of Maine / University of La Plata / UBA / USL / Pierre Auger Cosmic Rays Observatory Malargüe / University of Texas.',
      ),
      text(
        'Transportation, assistance, and logistics in geological university campaigns. Italian and English interpreter.',
      ),
      text(
        'SIGMA Project - Mauna / Aconcagua (Chile, Mendoza, Neuquén, La Pampa, Jocolí, San Juan)',
      ),
      text(
        'Manufacturing and installation of stations with GPS equipment for tectonic studies of the RapidResponse Program (Maule earthquake, Chile) and manufacturing and installation of GPS stations in areas of influence in Argentine territory.',
      ),
      list([
        'Logistics in alluvial fan studies in the drylands of Lavalle, Mendoza.',
        'Installation of Seismic Sensors at the Caviahue Copahue Volcanic Complex.',
        'Logistical Assistance for Visit to the Payunia Volcanic Area, Malargüe, Mendoza.',
      ]),
    ],
    displayOrder: 9,
  },
];

async function main() {
  console.log(`[seed-experiences] Conectando a la base de datos en ${process.env.DB_HOST}:${process.env.DB_PORT}...`);

  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:
      (process.env.DB_SSL ?? 'false').toLowerCase() === 'true'
        ? { rejectUnauthorized: false }
        : false,
  });

  await client.connect();
  console.log('[seed-experiences] Conexión establecida.');

  try {
    await client.query('BEGIN');
    console.log('[seed-experiences] Transacción iniciada.');

    for (const exp of experiences) {
      // Idempotencia: se elimina la fila anterior con el mismo título (ES) antes de reinsertar.
      await client.query('DELETE FROM experiences WHERE title_es = $1', [exp.titleEs]);

      await client.query(
        `INSERT INTO experiences
           (title_es, title_en, location_es, location_en, description_es, description_en, display_order, is_active)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, true)`,
        [
          exp.titleEs,
          exp.titleEn,
          exp.locationEs,
          exp.locationEn,
          JSON.stringify(exp.descriptionEs),
          JSON.stringify(exp.descriptionEn),
          exp.displayOrder,
        ],
      );
      console.log(`[seed-experiences] Insertada: ${exp.titleEs}`);
    }

    await client.query('COMMIT');
    console.log(`[seed-experiences] Listo. Se cargaron ${experiences.length} experiencias.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[seed-experiences] Error durante la carga. Se realizó rollback.');
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[seed-experiences] Error al cargar las experiencias:', err);
  process.exit(1);
});
