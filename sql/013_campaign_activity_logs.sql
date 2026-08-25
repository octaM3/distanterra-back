-- Bitácora de actividades/coordinaciones registradas manualmente durante una
-- campaña (ej. "el día xx/xx/xxxx coordinamos la campaña de geofísica de...").
CREATE TABLE IF NOT EXISTS campaign_activity_logs (
    id             SERIAL PRIMARY KEY,
    campaign_id    INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    log_date       DATE NOT NULL,
    description    TEXT NOT NULL,
    created_by     INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_campaign_activity_logs_not_deleted ON campaign_activity_logs (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_activity_logs_campaign ON campaign_activity_logs (campaign_id);

COMMENT ON TABLE campaign_activity_logs IS 'Bitácora de actividades registradas manualmente durante una campaña, ordenable por fecha.';
