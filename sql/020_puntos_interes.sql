-- Puntos de interés para el mapa interactivo de montaña de la app (refugios,
-- miradores, fuentes de agua, zonas de peligro, campamentos, etc.).
CREATE TABLE IF NOT EXISTS puntos_interes (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(255) NOT NULL,
    telefono    VARCHAR(50),
    comentario  TEXT,
    categoria   VARCHAR(20) NOT NULL,
    latitude    DOUBLE PRECISION NOT NULL,
    longitude   DOUBLE PRECISION NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_puntos_interes_categoria CHECK (
        categoria IN ('refugio', 'mirador', 'agua', 'peligro', 'campamento')
    ),
    CONSTRAINT chk_puntos_interes_latitude CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_puntos_interes_longitude CHECK (longitude BETWEEN -180 AND 180)
);

COMMENT ON TABLE puntos_interes IS 'Puntos de interés para el mapa interactivo de montaña (refugios, miradores, agua, peligro, campamentos).';
