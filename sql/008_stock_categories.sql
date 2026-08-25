-- Categorías del catálogo de stock (Carpas, Vehículos, Iluminación,
-- Herramientas, etc.), con ABM propio en vez de texto libre en stock_items.
CREATE TABLE IF NOT EXISTS stock_categories (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_stock_categories_not_deleted ON stock_categories (deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE stock_categories IS 'Categorías del catálogo de stock (Carpas, Vehículos, Iluminación, Herramientas, etc.).';
