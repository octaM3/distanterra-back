-- Vehículos asignados (y por lo tanto bloqueados) a una campaña, con el
-- precio vigente al momento de asignarlos (snapshot). A diferencia de
-- campaign_stock_items no tiene "quantity": un vehículo es un bien único,
-- se asigna entero o no se asigna. Mientras una fila exista con
-- deleted_at IS NULL y su campaña no esté finalizada, el vehículo queda
-- bloqueado para otra campaña SOLO durante su propia ventana de uso
-- (start_date/end_date de esta fila) — fuera de esas fechas puede
-- asignarse a otra campaña (ver isAvailable en vehicles.service.ts).
CREATE TABLE IF NOT EXISTS campaign_vehicles (
    id             SERIAL PRIMARY KEY,
    campaign_id    INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    vehicle_id     INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    -- Snapshot de ambos precios del catálogo al momento de asignar (para no
    -- verse afectados si el precio del catálogo cambia después). El costo se
    -- calcula automáticamente combinando los dos: ver computeVehicleCost.
    price_per_day   NUMERIC(12,2),
    price_per_month NUMERIC(12,2),
    -- Override manual del costo total (reemplaza el cálculo automático de
    -- price_per_day/price_per_month cuando no es NULL). Se muestra como
    -- valor recomendado (placeholder) en el form, pero el admin puede
    -- cargar cualquier otro monto.
    manual_cost     NUMERIC(12,2),
    -- Rango dentro de la campaña en el que se usa el vehículo (puede ser
    -- menor a la duración completa de la campaña, o igual a ella si se elige
    -- "toda la expedición"); determina el costo real (ver computeVehicleCost:
    -- meses completos a price_per_month + días sueltos a price_per_day).
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL,
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ,
    CONSTRAINT chk_campaign_vehicles_date_range CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_campaign_vehicles_not_deleted ON campaign_vehicles (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_vehicles_campaign ON campaign_vehicles (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_vehicles_vehicle ON campaign_vehicles (vehicle_id);
-- Soporta el chequeo de disponibilidad por rango de fechas (ver isAvailable).
CREATE INDEX IF NOT EXISTS idx_campaign_vehicles_availability ON campaign_vehicles (vehicle_id, start_date, end_date) WHERE deleted_at IS NULL;

COMMENT ON TABLE campaign_vehicles IS 'Vehículos asignados/bloqueados a una campaña, con snapshot del precio vigente al asignarlos.';
COMMENT ON COLUMN campaign_vehicles.start_date IS 'Día desde el que se usa el vehículo dentro de la campaña (debe caer dentro del rango de fechas de la campaña, validado en la app).';
COMMENT ON COLUMN campaign_vehicles.end_date IS 'Día hasta el que se usa el vehículo (inclusive).';
