-- Animales de carga (tracción a sangre) asignados a una campaña. Igual que
-- campaign_guides, no son un catálogo (ABM): tipo de animal, precio por día
-- y % de impuestos se cargan directamente en el formulario al asignarlos
-- (ver campaign-pack-animals.service.ts). Sin chequeo de
-- disponibilidad/superposición: no son un bien propio con cantidad
-- limitada.
CREATE TABLE IF NOT EXISTS campaign_pack_animals (
    id              SERIAL PRIMARY KEY,
    campaign_id     INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    -- Tipo de animal (ej. "Caballo", "Burro", "Mula"), texto libre.
    animal_type     VARCHAR(100) NOT NULL,
    quantity        INTEGER NOT NULL,
    price_per_day   NUMERIC(12,2),
    tax_percentage  NUMERIC(5,2),
    -- Override manual del costo total: si no es null, reemplaza el cálculo
    -- automático como costo final de esta asignación.
    manual_cost     NUMERIC(12,2),
    -- Rango dentro de la campaña en el que se contrata (puede ser menor a
    -- la duración completa de la campaña); determina el costo real.
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT chk_campaign_pack_animals_date_range CHECK (end_date >= start_date),
    CONSTRAINT chk_campaign_pack_animals_quantity CHECK (quantity >= 1)
);

CREATE INDEX IF NOT EXISTS idx_campaign_pack_animals_not_deleted ON campaign_pack_animals (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_pack_animals_campaign ON campaign_pack_animals (campaign_id);

COMMENT ON TABLE campaign_pack_animals IS 'Animales de carga (tracción a sangre) asignados a una campaña, con tipo/precio/impuestos cargados directamente en el formulario (no hay catálogo).';
COMMENT ON COLUMN campaign_pack_animals.animal_type IS 'Tipo de animal (ej. Caballo, Burro, Mula), texto libre.';
COMMENT ON COLUMN campaign_pack_animals.quantity IS 'Cantidad de animales contratados en esta asignación; sin tope (no hay control de inventario).';
COMMENT ON COLUMN campaign_pack_animals.price_per_day IS 'Precio por animal por día, cargado en el formulario al asignar.';
COMMENT ON COLUMN campaign_pack_animals.tax_percentage IS 'Porcentaje de impuestos aplicado sobre price_per_day (ej. 21 = 21%).';
COMMENT ON COLUMN campaign_pack_animals.start_date IS 'Día desde el que se contrata (debe caer dentro del rango de fechas de la campaña, validado en la app). Determina la cantidad de días que se cobra.';
COMMENT ON COLUMN campaign_pack_animals.end_date IS 'Día hasta el que se contrata (inclusive).';
