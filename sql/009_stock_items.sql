-- Catálogo de productos/equipos en stock de Distanterra (carpas, camionetas,
-- luces, herramientas específicas, etc.) asignables a campañas.
-- Un ítem pago puede tener precio por día, por mes, o ambos a la vez: la
-- modalidad de cobro se elige al asignarlo a cada campaña puntual (ver
-- pricing_type en campaign_stock_items). Un ítem sin ningún precio cargado
-- es gratuito (ej. cubiertos).
--
-- Se dropea y recrea porque todavía está en desarrollo activo (sin datos
-- reales que preservar); a partir de acá los cambios de esquema se hacen con
-- nuevos archivos, no reescribiendo este.
DROP TABLE IF EXISTS stock_items CASCADE;

CREATE TABLE stock_items (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    category_id      INTEGER NOT NULL REFERENCES stock_categories(id) ON DELETE RESTRICT,
    unit             VARCHAR(50) NOT NULL DEFAULT 'unidad',
    total_quantity   INTEGER NOT NULL DEFAULT 0,
    price_per_day    NUMERIC(12,2),
    price_per_month  NUMERIC(12,2),
    notes            TEXT,
    is_active        BOOLEAN NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at       TIMESTAMPTZ,
    CONSTRAINT chk_stock_items_total_quantity CHECK (total_quantity >= 0)
);

CREATE INDEX idx_stock_items_not_deleted ON stock_items (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_stock_items_category ON stock_items (category_id);

COMMENT ON TABLE stock_items IS 'Catálogo de productos/equipos en stock de Distanterra asignables a campañas.';
COMMENT ON COLUMN stock_items.price_per_day IS 'Precio por día, si aplica. Puede coexistir con price_per_month.';
COMMENT ON COLUMN stock_items.price_per_month IS 'Precio por mes, si aplica. Puede coexistir con price_per_day.';
COMMENT ON COLUMN stock_items.total_quantity IS 'Cantidad total que posee la empresa. La cantidad disponible se calcula restando lo asignado a campañas no finalizadas.';
