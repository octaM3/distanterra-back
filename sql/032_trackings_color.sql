-- Color de la línea del tracking sobre el mapa, elegido al subirlo.
-- Se guarda como hexadecimal de 7 caracteres, con el numeral: "#2563eb".
--
-- Es nullable a propósito: los trackings que ya existían no tienen color
-- elegido y el frontend les sigue asignando uno de la paleta cíclica por id
-- (ver trackColor en MapaPuntos.tsx), así no hace falta migrar datos.
ALTER TABLE trackings ADD COLUMN IF NOT EXISTS color VARCHAR(7);

ALTER TABLE trackings DROP CONSTRAINT IF EXISTS chk_trackings_color;
ALTER TABLE trackings ADD CONSTRAINT chk_trackings_color CHECK (
    color IS NULL OR color ~ '^#[0-9a-fA-F]{6}$'
);

COMMENT ON COLUMN trackings.color IS 'Color hexadecimal de la línea en el mapa (#rrggbb). NULL = color automático por id.';
