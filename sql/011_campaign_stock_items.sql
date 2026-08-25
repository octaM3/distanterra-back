-- Ítems de stock asignados (y por lo tanto bloqueados) a una campaña, con el
-- precio vigente al momento de asignarlos (snapshot, para no verse afectados
-- si el precio del catálogo cambia después).
-- Mientras una fila exista con deleted_at IS NULL y su campaña no esté
-- finalizada (campaigns.finished_at IS NULL), la cantidad queda descontada
-- del stock disponible del ítem.
CREATE TABLE IF NOT EXISTS campaign_stock_items (
    id             SERIAL PRIMARY KEY,
    campaign_id    INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    stock_item_id  INTEGER NOT NULL REFERENCES stock_items(id) ON DELETE RESTRICT,
    quantity       INTEGER NOT NULL,
    pricing_type   VARCHAR(20) NOT NULL,
    unit_price     NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ,
    CONSTRAINT chk_campaign_stock_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_campaign_stock_items_pricing_type CHECK (pricing_type IN ('per_day', 'per_month', 'none'))
);

CREATE INDEX IF NOT EXISTS idx_campaign_stock_items_not_deleted ON campaign_stock_items (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_stock_items_campaign ON campaign_stock_items (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_stock_items_stock_item ON campaign_stock_items (stock_item_id);

COMMENT ON TABLE campaign_stock_items IS 'Ítems de stock asignados/bloqueados a una campaña, con snapshot del precio vigente al asignarlos.';
