-- Campañas de logística minera organizadas para una empresa cliente.
-- Se crean antes de iniciar (status calculado, no almacenado, en base a las
-- fechas y a finished_at). El stock/vehículo asignado queda bloqueado solo
-- durante su propia ventana de uso (start_date/end_date de la asignación,
-- no toda la duración de la campaña) mientras la campaña no esté finalizada
-- (ver las tablas campaign_stock_items y campaign_vehicles).
--
-- La tabla lleva dos discriminadores, independientes entre sí:
--
--   kind             qué es: una expedición completa o un alquiler suelto.
--   approval_status  en qué punto del acuerdo con el cliente está: todavía es
--                    un presupuesto, está en firme, o lo rechazaron.
--
-- Los dos existen para no duplicar tablas: un servicio y un presupuesto
-- tienen exactamente la misma forma que una campaña —las mismas asignaciones,
-- el mismo control de disponibilidad, los mismos costos—, y separarlos
-- obligaría a copiar filas de una tabla a otra cada vez que un presupuesto se
-- aprueba o a arriesgar que un mismo vehículo se alquile dos veces.
CREATE TABLE IF NOT EXISTS campaigns (
    id              SERIAL PRIMARY KEY,
    company_id      INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    kind            VARCHAR(20) NOT NULL DEFAULT 'campana',
    -- Un presupuesto no reserva stock ni vehículos: hasta que el cliente lo
    -- apruebe, lo que se le cargó sigue disponible para el resto. Ver
    -- RESERVING_APPROVAL_STATUS en campaign.entity.ts, que es el filtro que
    -- aplican todas las consultas de disponibilidad.
    approval_status VARCHAR(20) NOT NULL DEFAULT 'aprobada',
    approved_at     TIMESTAMPTZ,
    rejected_at     TIMESTAMPTZ,
    -- IVA del PDF que se le manda a la empresa. No afecta los costos internos
    -- de la campaña, que se siguen calculando sin impuesto.
    tax_percentage  NUMERIC(5,2),
    name            VARCHAR(255) NOT NULL,
    location        VARCHAR(255),
    description     TEXT,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    finished_at     TIMESTAMPTZ,
    created_by      INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT chk_campaigns_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_campaigns_kind CHECK (kind IN ('campana', 'servicio')),
    CONSTRAINT chk_campaigns_approval_status CHECK (
        approval_status IN ('presupuesto', 'aprobada', 'rechazada')
    ),
    CONSTRAINT chk_campaigns_tax_percentage CHECK (
        tax_percentage IS NULL OR (tax_percentage >= 0 AND tax_percentage <= 100)
    )
);

CREATE INDEX IF NOT EXISTS idx_campaigns_not_deleted ON campaigns (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_company ON campaigns (company_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_kind ON campaigns (kind);
-- Para las consultas de disponibilidad, que descartan los presupuestos.
CREATE INDEX IF NOT EXISTS idx_campaigns_approval_status ON campaigns (approval_status);

COMMENT ON TABLE campaigns IS 'Campañas de logística minera organizadas para una empresa cliente, más los servicios sueltos y los presupuestos de ambos.';
COMMENT ON COLUMN campaigns.kind IS 'campana = expedición completa; servicio = alquiler suelto de stock/vehículos, sin baqueanos ni gastos.';
COMMENT ON COLUMN campaigns.approval_status IS 'presupuesto = todavía no lo aprobó el cliente, no reserva stock ni vehículos; aprobada = campaña/servicio en firme; rechazada = el cliente lo rechazó.';
COMMENT ON COLUMN campaigns.tax_percentage IS 'IVA que se le suma al presupuesto en el PDF del cliente. No afecta los costos internos de la campaña.';
COMMENT ON COLUMN campaigns.end_date IS 'Fecha de fin planificada. Puede ampliarse mientras la campaña no esté finalizada.';
COMMENT ON COLUMN campaigns.finished_at IS 'Momento en que se finalizó manualmente la campaña. NULL mientras está planificada o en curso; al setearse libera todo el stock asignado.';
