-- Gastos extra surgidos durante una campaña (ej. compra de comida en el
-- supermercado el día X), con foto de la factura opcional.
CREATE TABLE IF NOT EXISTS campaign_expenses (
    id                  SERIAL PRIMARY KEY,
    campaign_id         INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    description         VARCHAR(255) NOT NULL,
    -- Categoría del gasto, tomada del mismo catálogo que clasifica el stock
    -- (stock_categories) para que el desplegable del formulario ofrezca
    -- siempre valores consistentes en vez de texto libre. Opcional.
    category_id         INTEGER REFERENCES stock_categories(id) ON DELETE SET NULL,
    amount              NUMERIC(12,2) NOT NULL,
    expense_date        DATE NOT NULL,
    invoice_image_path  VARCHAR(500),
    created_by          INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ,
    CONSTRAINT chk_campaign_expenses_amount CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_campaign_expenses_not_deleted ON campaign_expenses (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_expenses_campaign ON campaign_expenses (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_expenses_category ON campaign_expenses (category_id);

COMMENT ON TABLE campaign_expenses IS 'Gastos extra surgidos durante una campaña (ej. comida), con foto de factura opcional.';
