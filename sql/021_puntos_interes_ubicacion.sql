-- País/provincia del punto de interés (completados automáticamente por
-- geocodificación inversa en el front cuando es posible, con selección
-- manual como respaldo). Opcionales: puntos ya cargados quedan sin valor.
ALTER TABLE puntos_interes ADD COLUMN IF NOT EXISTS pais VARCHAR(100);
ALTER TABLE puntos_interes ADD COLUMN IF NOT EXISTS provincia VARCHAR(100);
