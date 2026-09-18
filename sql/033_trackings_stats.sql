-- Métricas del recorrido y datos crudos del archivo, calculados/extraídos al
-- subir el .kmz (ver kml-parser.util.ts).
--
-- "stats" va como JSONB y no en columnas sueltas porque es un bloque que se
-- guarda y se muestra entero, y así sumar una métrica más adelante no requiere
-- otra migración. Sigue siendo consultable con los operadores JSON de Postgres.
ALTER TABLE trackings ADD COLUMN IF NOT EXISTS stats JSONB;

-- Texto de las <description> del .kmz, ya sin HTML: ahí vienen los datos que
-- la aplicación no calcula (tiempo en movimiento, velocidad máxima, clima).
-- Depende de qué app haya exportado el archivo, por eso se guarda tal cual y
-- se muestra aparte de las métricas propias.
ALTER TABLE trackings ADD COLUMN IF NOT EXISTS device_info TEXT;

COMMENT ON COLUMN trackings.stats IS 'Métricas calculadas del recorrido: duración, distancia, altitudes, desnivel y velocidad media.';
COMMENT ON COLUMN trackings.device_info IS 'Descripciones del .kmz en texto plano, tal como las dejó la app que lo exportó.';
