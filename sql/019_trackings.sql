-- Tracks GPS (subidos como .kmz) para pintar como línea sobre el mapa de
-- puntos de interés. Los puntos de la línea se decodifican del .kmz al
-- subirlo (ver kml-parser.util.ts) y se guardan ya listos para el mapa;
-- el .kmz original se conserva aparte por si hace falta descargarlo.
CREATE TABLE IF NOT EXISTS trackings (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(255) NOT NULL,
    descripcion TEXT,
    points      JSONB NOT NULL,
    -- Color de la línea en el mapa, "#rrggbb". NULL = automático por id, que
    -- es lo que usan los trackings cargados antes de que fuera elegible.
    color       VARCHAR(7),
    -- Métricas del recorrido calculadas al subir el .kmz. Va como JSONB y no
    -- en columnas sueltas porque es un bloque que se guarda y se muestra
    -- entero: sumar una métrica más adelante no toca el esquema.
    stats       JSONB,
    -- Texto de las <description> del .kmz sin HTML: ahí vienen los datos que
    -- la aplicación no calcula (tiempo en movimiento, velocidad máxima,
    -- clima), y dependen de qué app haya exportado el archivo.
    device_info TEXT,
    file_path   VARCHAR(500) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_trackings_color CHECK (color IS NULL OR color ~ '^#[0-9a-fA-F]{6}$')
);

COMMENT ON TABLE trackings IS 'Tracks GPS (.kmz) mostrados como línea sobre el mapa de puntos de interés.';
COMMENT ON COLUMN trackings.color IS 'Color hexadecimal de la línea en el mapa (#rrggbb). NULL = color automático por id.';
COMMENT ON COLUMN trackings.stats IS 'Métricas calculadas del recorrido: duración, distancia, altitudes, desnivel y velocidad media.';
COMMENT ON COLUMN trackings.device_info IS 'Descripciones del .kmz en texto plano, tal como las dejó la app que lo exportó.';
