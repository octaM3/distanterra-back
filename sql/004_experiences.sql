-- "Experience" entries shown in the landing page Experiences section.
-- title / location: bilingual, location is optional.
-- description_es / description_en: JSONB array of dynamic content blocks so the
--   description can mix free text and itemized lists in any order, e.g.:
--   [
--     { "type": "text", "content": "Some paragraph..." },
--     { "type": "list", "items": ["Item one", "Item two"] },
--     { "type": "text", "content": "Closing paragraph..." }
--   ]
CREATE TABLE IF NOT EXISTS experiences (
    id             SERIAL PRIMARY KEY,
    title_es       VARCHAR(255) NOT NULL,
    title_en       VARCHAR(255) NOT NULL,
    location_es    VARCHAR(255),
    location_en    VARCHAR(255),
    description_es JSONB NOT NULL DEFAULT '[]'::jsonb,
    description_en JSONB NOT NULL DEFAULT '[]'::jsonb,
    display_order  INTEGER NOT NULL DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_experiences_not_deleted ON experiences (deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE experiences IS 'Company experience/project entries shown on the landing page.';
COMMENT ON COLUMN experiences.description_es IS 'Ordered array of dynamic blocks: {type: "text", content} | {type: "list", items: string[]}';

-- La tabla experience_bosses ("jefe/jefes") fue removida: el campo bosses ya no
-- se usa en las experiencias. Ver migración 005_drop_experience_bosses.sql.
