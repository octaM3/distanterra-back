-- Una campaña se controla una sola vez: si ya tiene su registro en la vista de
-- gestión, no se puede crear otro para la misma campaña. Índice parcial para
-- que los servicios sueltos (campaign_id NULL) no se vean afectados y para que
-- un registro eliminado no bloquee volver a cargar esa campaña.
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_records_unique_campaign
    ON service_records (campaign_id)
    WHERE campaign_id IS NOT NULL AND deleted_at IS NULL;
