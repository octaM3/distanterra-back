-- Ítems de stock asignados (y por lo tanto bloqueados) a una campaña, con el
-- precio vigente al momento de asignarlos (snapshot, para no verse afectados
-- si el precio del catálogo cambia después).
-- Mientras una fila exista con deleted_at IS NULL y su campaña no esté
-- finalizada (campaigns.finished_at IS NULL), la cantidad queda descontada
-- del stock disponible del ítem SOLO durante su propia ventana de uso
-- (start_date/end_date de esta fila) — fuera de esas fechas, el mismo ítem
-- puede asignarse a otra campaña (ver getAvailableQuantity en
-- stock-items.service.ts).
CREATE TABLE IF NOT EXISTS campaign_stock_items (
    id             SERIAL PRIMARY KEY,
    campaign_id    INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    stock_item_id  INTEGER NOT NULL REFERENCES stock_items(id) ON DELETE RESTRICT,
    quantity       INTEGER NOT NULL,
    -- Sin costo: se ignoran price_per_day/price_per_month y el costo es 0
    -- (ej. ítems propios que no se facturan). No es una modalidad de cobro,
    -- es un override explícito por sobre el cálculo automático.
    no_cost        BOOLEAN NOT NULL DEFAULT false,
    -- Snapshot de ambos precios del catálogo al momento de asignar (para no
    -- verse afectados si el precio del catálogo cambia después). El costo se
    -- calcula automáticamente combinando los dos: ver computeStockItemCost.
    price_per_day   NUMERIC(12,2),
    price_per_month NUMERIC(12,2),
    -- Override manual del costo total (reemplaza el cálculo automático de
    -- price_per_day/price_per_month cuando no es NULL). Se muestra como
    -- valor recomendado (placeholder) en el form, pero el admin puede
    -- cargar cualquier otro monto.
    manual_cost     NUMERIC(12,2),
    -- Rango dentro de la campaña en el que se alquila este ítem puntual
    -- (puede ser menor a la duración completa de la campaña, ej. una carpa
    -- que solo se usa 10 de los 40 días que dura la expedición); determina
    -- el costo real en vez de la duración completa de la campaña.
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL,
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ,
    CONSTRAINT chk_campaign_stock_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_campaign_stock_items_date_range CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_campaign_stock_items_not_deleted ON campaign_stock_items (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_stock_items_campaign ON campaign_stock_items (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_stock_items_stock_item ON campaign_stock_items (stock_item_id);
-- Soporta el chequeo de disponibilidad por rango de fechas (ver getAvailableQuantity).
CREATE INDEX IF NOT EXISTS idx_campaign_stock_items_availability ON campaign_stock_items (stock_item_id, start_date, end_date) WHERE deleted_at IS NULL;

COMMENT ON TABLE campaign_stock_items IS 'Ítems de stock asignados/bloqueados a una campaña, con snapshot del precio vigente al asignarlos.';
COMMENT ON COLUMN campaign_stock_items.start_date IS 'Día desde el que se alquila este ítem dentro de la campaña (debe caer dentro del rango de fechas de la campaña, validado en la app).';
COMMENT ON COLUMN campaign_stock_items.end_date IS 'Día hasta el que se alquila este ítem (inclusive).';
