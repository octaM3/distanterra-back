import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const CATEGORIAS_PUNTO_INTERES = [
  'refugio',
  'mirador',
  'agua',
  'peligro',
  'campamento',
] as const;
export type CategoriaPuntoInteres = (typeof CATEGORIAS_PUNTO_INTERES)[number];

@Entity({ name: 'puntos_interes' })
export class PuntoInteres {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono: string | null;

  @Column({ type: 'text', nullable: true })
  comentario: string | null;

  // Define qué ícono se pinta en el mapa (ver categoryIcons.ts en el front).
  @Column({ type: 'varchar', length: 20 })
  categoria: CategoriaPuntoInteres;

  // País/provincia del punto: el front intenta completarlos automáticamente
  // por geocodificación inversa (Nominatim) a partir de lat/lng, con
  // selección manual (Argentina por defecto) como respaldo si eso falla.
  @Column({ type: 'varchar', length: 100, nullable: true })
  pais: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provincia: string | null;

  @Column({ type: 'double precision' })
  latitude: number;

  @Column({ type: 'double precision' })
  longitude: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
