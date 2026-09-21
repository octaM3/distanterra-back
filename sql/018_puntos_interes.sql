-- Puntos de interés para el mapa interactivo de montaña de la app: lo que la
-- operación necesita ubicar (hospitales, gendarmería, campamentos, baqueanos,
-- restaurantes, alojamiento) más "otro" como catch-all.
CREATE TABLE IF NOT EXISTS puntos_interes (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(255) NOT NULL,
    telefono    VARCHAR(50),
    comentario  TEXT,
    categoria   VARCHAR(20) NOT NULL,
    latitude    DOUBLE PRECISION NOT NULL,
    longitude   DOUBLE PRECISION NOT NULL,
    -- Se completan por geocodificación inversa desde el front cuando se puede,
    -- con selección manual como respaldo. Opcionales.
    pais        VARCHAR(100),
    provincia   VARCHAR(100),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- "otro" es el catch-all para lo que no encaja en las seis sugeridas; el
    -- front le da un ícono genérico (ver categoryIcons.ts).
    CONSTRAINT chk_puntos_interes_categoria CHECK (
        categoria IN (
            'hospital', 'gendarmeria', 'campamento',
            'baqueano', 'restaurante', 'alojamiento', 'otro'
        )
    ),
    CONSTRAINT chk_puntos_interes_latitude CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_puntos_interes_longitude CHECK (longitude BETWEEN -180 AND 180)
);

COMMENT ON TABLE puntos_interes IS 'Puntos de interés para el mapa interactivo de montaña (hospitales, gendarmería, campamentos, baqueanos, restaurantes, alojamiento).';
