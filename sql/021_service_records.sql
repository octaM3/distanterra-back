-- Control general de lo que la empresa le brindó a cada cliente, mes a mes:
-- campañas y también servicios sueltos (alquiler de camioneta, Starlink,
-- reparaciones, etc.), con el estado de facturación y de cobro de cada uno.
--
-- Ese estado no se guarda acá: se deriva de los archivos cargados (hay
-- factura => facturado, hay recibo => cobrado, ver financial_documents), para
-- que no pueda existir un "facturado" sin respaldo.
CREATE TABLE IF NOT EXISTS service_records (
    id                  SERIAL PRIMARY KEY,
    -- Mes al que corresponde el servicio, como 'YYYY-MM': la vista es un
    -- control mensual, no interesa el día exacto.
    service_month       VARCHAR(7) NOT NULL,
    company_id          INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    -- Solo cuando el servicio ES una campaña ya cargada en el sistema; los
    -- servicios sueltos (alquileres, reparaciones) no tienen campaña. Si la
    -- campaña se elimina, la fila queda igual como registro histórico.
    campaign_id         INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
    service_description VARCHAR(255) NOT NULL,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ,
    CONSTRAINT chk_service_records_month CHECK (service_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$')
);

CREATE INDEX IF NOT EXISTS idx_service_records_not_deleted ON service_records (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_records_month ON service_records (service_month);
CREATE INDEX IF NOT EXISTS idx_service_records_company ON service_records (company_id);
CREATE INDEX IF NOT EXISTS idx_service_records_campaign ON service_records (campaign_id);

-- Una campaña se controla una sola vez. Índice parcial para que los servicios
-- sueltos (campaign_id NULL) no se vean afectados y para que un registro
-- eliminado no bloquee volver a cargar esa campaña.
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_records_unique_campaign
    ON service_records (campaign_id)
    WHERE campaign_id IS NOT NULL AND deleted_at IS NULL;

COMMENT ON TABLE service_records IS 'Control mensual de servicios brindados a cada empresa (campañas y otros), con estado de facturación y cobro.';
