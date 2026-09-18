import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TrackStats } from '@/common/utils/kml-parser.util';

@Entity({ name: 'trackings' })
export class Tracking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  // [[lat, lng], ...] ya decodificado del .kmz al momento de subirlo (ver
  // parseKmzTrack) — el mapa lo pinta directo, sin descomprimir/parsear XML
  // en cada carga.
  @Column({ type: 'jsonb' })
  points: [number, number][];

  // Color de la línea en el mapa, en hexadecimal "#rrggbb". Nullable: los
  // trackings anteriores a esta columna no tienen uno elegido y el frontend
  // les asigna un color automático por id.
  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string | null;

  // Se conserva el .kmz original para poder descargarlo, aunque el mapa use
  // `points` para dibujar la línea.
  @Column({ type: 'varchar', length: 500, name: 'file_path' })
  filePath: string;

  // Métricas calculadas del recorrido al subir el archivo (duración,
  // distancia, desnivel, etc). Nullable: los trackings anteriores a esta
  // columna no las tienen hasta que se los reprocese con "npm run
  // trackings:backfill-stats".
  @Column({ type: 'jsonb', nullable: true })
  stats: TrackStats | null;

  // Descripciones del .kmz en texto plano, tal como las dejó la app que lo
  // exportó: ahí vienen los datos que no se calculan acá.
  @Column({ type: 'text', name: 'device_info', nullable: true })
  deviceInfo: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
