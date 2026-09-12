import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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

  // Se conserva el .kmz original para poder descargarlo, aunque el mapa use
  // `points` para dibujar la línea.
  @Column({ type: 'varchar', length: 500, name: 'file_path' })
  filePath: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
