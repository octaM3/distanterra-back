-- Tracks GPS (subidos como .kmz) para pintar como línea sobre el mapa de
-- puntos de interés. Los puntos de la línea se decodifican del .kmz al
-- subirlo (ver kml-parser.util.ts) y se guardan ya listos para el mapa;
-- el .kmz original se conserva aparte por si hace falta descargarlo.
CREATE TABLE IF NOT EXISTS trackings (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(255) NOT NULL,
    descripcion TEXT,
    points      JSONB NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE trackings IS 'Tracks GPS (.kmz) mostrados como línea sobre el mapa de puntos de interés.';
