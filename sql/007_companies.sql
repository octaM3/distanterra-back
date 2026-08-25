-- Empresas mineras clientes para las que Distanterra organiza campañas de logística.
-- Puede haber múltiples campañas para la misma empresa.
CREATE TABLE IF NOT EXISTS companies (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    contact_name   VARCHAR(255),
    contact_email  VARCHAR(255),
    contact_phone  VARCHAR(50),
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_companies_not_deleted ON companies (deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE companies IS 'Empresas mineras clientes para las que se organizan campañas de logística.';
