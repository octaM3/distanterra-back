-- Vehículos que la empresa alquila a terceros para las campañas. A
-- diferencia del catálogo de stock (stock_items), cada vehículo es un bien
-- único identificado por su patente, no una cantidad de unidades
-- intercambiables: no tiene total_quantity, se asigna entero o no se asigna.
CREATE TABLE IF NOT EXISTS vehicles (
    id                  SERIAL PRIMARY KEY,
    license_plate       VARCHAR(20) NOT NULL UNIQUE,
    description         VARCHAR(255),
    price_per_day       NUMERIC(12,2),
    price_per_month     NUMERIC(12,2),
    notes               TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_vehicles_not_deleted ON vehicles (deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE vehicles IS 'Vehículos alquilados a terceros para campañas; cada uno es único (patente), no una cantidad.';
COMMENT ON COLUMN vehicles.price_per_day IS 'Precio por día, si aplica. Puede coexistir con price_per_month.';
COMMENT ON COLUMN vehicles.price_per_month IS 'Precio por mes, si aplica. "Campaña completa" no es un precio aparte: sale de multiplicar este precio (o el de por día) por la duración de la campaña.';
