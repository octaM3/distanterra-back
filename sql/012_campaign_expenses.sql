-- Gastos extra surgidos durante una campaña (ej. compra de comida en el
-- supermercado el día X), con foto de la factura opcional.
--
-- El monto se lleva en dos columnas y no en una con su moneda: un mismo gasto
-- puede tener parte en dólares y parte en pesos, y no hay tipo de cambio con
-- el que unificarlos (los totales los reportan por separado).
CREATE TABLE IF NOT EXISTS campaign_expenses (
    id                  SERIAL PRIMARY KEY,
    campaign_id         INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    description         VARCHAR(255) NOT NULL,
    -- Categoría del gasto, tomada del mismo catálogo que clasifica el stock
    -- (stock_categories) para que el desplegable del formulario ofrezca
    -- siempre valores consistentes en vez de texto libre. Opcional.
    category_id         INTEGER REFERENCES stock_categories(id) ON DELETE SET NULL,
    amount_usd          NUMERIC(12,2),
    amount_ars          NUMERIC(12,2),
    expense_date        DATE NOT NULL,
    invoice_image_path  VARCHAR(500),
    -- Datos de la factura, todos opcionales y de texto libre salvo
    -- invoice_type, que es un catálogo fijo (letra de factura AFIP).
    -- invoice_number es el número/ID impreso, distinto de la letra.
    invoice_type        VARCHAR(20),
    invoice_number      VARCHAR(100),
    business_name       VARCHAR(255),
    created_by          INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ,
    -- Al menos uno de los dos montos: un gasto sin importe no es un gasto.
    CONSTRAINT chk_campaign_expenses_amount CHECK (
        amount_usd IS NOT NULL OR amount_ars IS NOT NULL
    ),
    CONSTRAINT chk_campaign_expenses_invoice_type CHECK (
        invoice_type IS NULL
        OR invoice_type IN ('Factura A', 'Factura B', 'Factura C', 'Factura E', 'Factura T', 'Factura M')
    )
);

CREATE INDEX IF NOT EXISTS idx_campaign_expenses_not_deleted ON campaign_expenses (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_expenses_campaign ON campaign_expenses (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_expenses_category ON campaign_expenses (category_id);

COMMENT ON TABLE campaign_expenses IS 'Gastos extra surgidos durante una campaña (ej. comida), con foto de factura opcional.';
