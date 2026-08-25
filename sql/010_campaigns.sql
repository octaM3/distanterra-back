-- Campañas de logística minera organizadas para una empresa cliente.
-- Se crean antes de iniciar (status calculado, no almacenado, en base a las
-- fechas y a finished_at). El stock asignado queda bloqueado desde que se
-- asigna hasta que la campaña se marca como finalizada manualmente
-- (ver campaign_stock_items en 010_campaign_stock_items.sql).
CREATE TABLE IF NOT EXISTS campaigns (
    id             SERIAL PRIMARY KEY,
    company_id     INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    name           VARCHAR(255) NOT NULL,
    location       VARCHAR(255),
    description    TEXT,
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL,
    finished_at    TIMESTAMPTZ,
    created_by     INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ,
    CONSTRAINT chk_campaigns_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_campaigns_not_deleted ON campaigns (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_company ON campaigns (company_id);

COMMENT ON TABLE campaigns IS 'Campañas de logística minera organizadas para una empresa cliente.';
COMMENT ON COLUMN campaigns.end_date IS 'Fecha de fin planificada. Puede ampliarse mientras la campaña no esté finalizada.';
COMMENT ON COLUMN campaigns.finished_at IS 'Momento en que se finalizó manualmente la campaña. NULL mientras está planificada o en curso; al setearse libera todo el stock asignado.';
