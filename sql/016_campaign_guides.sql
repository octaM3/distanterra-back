-- Baqueanos agregados a una campaña: no son un catálogo, así que el precio
-- por día y el % de impuestos se cargan directamente en el formulario al
-- agregarlos (junto con la cantidad y el rango de fechas dentro de la
-- campaña, como en stock/vehículos/animales de carga). Costo = quantity *
-- price_per_day * cantidad_de_días * (1 + tax_percentage/100), salvo
-- manual_cost — ver computeGuideCost en campaigns.util.ts.
CREATE TABLE IF NOT EXISTS campaign_guides (
    id              SERIAL PRIMARY KEY,
    campaign_id     INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL,
    price_per_day   NUMERIC(12,2),
    tax_percentage  NUMERIC(5,2),
    -- Override manual del costo total: si no es null, reemplaza el cálculo
    -- automático como costo final de esta asignación.
    manual_cost     NUMERIC(12,2),
    notes           TEXT,
    -- Rango dentro de la campaña en el que se contrata a los baqueanos
    -- (puede ser menor a la duración completa, o igual a ella si se elige
    -- "toda la expedición"); determina la cantidad de días que se cobra.
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT chk_campaign_guides_quantity CHECK (quantity >= 1),
    CONSTRAINT chk_campaign_guides_date_range CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_campaign_guides_not_deleted ON campaign_guides (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_guides_campaign ON campaign_guides (campaign_id);

COMMENT ON TABLE campaign_guides IS 'Cantidad de baqueanos agregados a una campaña, con rango de fechas y precio por día/% de impuestos cargados directamente en el formulario (no hay catálogo).';
COMMENT ON COLUMN campaign_guides.quantity IS 'Cantidad de baqueanos agregados; sin tope (no hay control de inventario).';
COMMENT ON COLUMN campaign_guides.price_per_day IS 'Precio por baqueano por día, cargado en el formulario al agregar.';
COMMENT ON COLUMN campaign_guides.tax_percentage IS 'Porcentaje de impuestos aplicado sobre price_per_day (ej. 21 = 21%).';
COMMENT ON COLUMN campaign_guides.start_date IS 'Día desde el que se contrata a los baqueanos (debe caer dentro del rango de fechas de la campaña, validado en la app). Determina la cantidad de días que se cobra.';
COMMENT ON COLUMN campaign_guides.end_date IS 'Día hasta el que se contrata (inclusive).';
