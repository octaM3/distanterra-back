-- Tres cambios que van juntos:
--
-- 1) Los "servicios" (alquiler de camioneta + Starlink, etc.) se guardan en la
--    misma tabla que las campañas, con un discriminador. Así comparten las
--    asignaciones de stock y vehículos —y, sobre todo, el control de
--    disponibilidad por fechas— en vez de duplicar esas tablas y arriesgar que
--    un mismo vehículo se alquile dos veces en los mismos días.
-- 2) Facturas y recibos llevan monto y moneda, para poder ver cuánta plata
--    falta cobrar y no solo si se cobró.
-- 3) Cada campaña/servicio tiene su ítem de gestión creado automáticamente: se
--    completan los que ya existían.

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS kind VARCHAR(20) NOT NULL DEFAULT 'campana';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_campaigns_kind') THEN
        ALTER TABLE campaigns ADD CONSTRAINT chk_campaigns_kind CHECK (kind IN ('campana', 'servicio'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_campaigns_kind ON campaigns (kind);

COMMENT ON COLUMN campaigns.kind IS 'campana = expedición completa; servicio = alquiler suelto de stock/vehículos, sin baqueanos ni gastos.';

-- Monto facturado / cobrado. Nullable en la tabla porque las notas de crédito
-- y el resumen del banco no lo usan; para facturas y recibos lo exige el
-- service (FinancialDocumentsService.applyTypeRules).
ALTER TABLE financial_documents ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2);
ALTER TABLE financial_documents ADD COLUMN IF NOT EXISTS currency VARCHAR(3);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_financial_documents_amount') THEN
        ALTER TABLE financial_documents
            ADD CONSTRAINT chk_financial_documents_amount CHECK (amount IS NULL OR amount >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_financial_documents_currency') THEN
        ALTER TABLE financial_documents
            ADD CONSTRAINT chk_financial_documents_currency CHECK (
                currency IS NULL OR currency IN ('ARS', 'USD')
            );
    END IF;
END $$;

-- Ítems de gestión faltantes: una campaña sin registro es una campaña que nadie
-- controla si se facturó. Desde ahora se crean solos al dar de alta la campaña
-- o el servicio (ver CampaignsService.create); esto completa las anteriores.
INSERT INTO service_records (service_month, company_id, campaign_id, service_description)
SELECT
    to_char(c.start_date, 'YYYY-MM'),
    c.company_id,
    c.id,
    CASE WHEN c.kind = 'servicio' THEN c.name ELSE 'Campaña' END
FROM campaigns c
WHERE c.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM service_records sr
      WHERE sr.campaign_id = c.id AND sr.deleted_at IS NULL
  );
