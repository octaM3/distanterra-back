-- "Experience" entries shown in the landing page Experiences section.
-- title / location: bilingual, location is optional.
-- description_es / description_en: JSONB array of dynamic content blocks so the
--   description can mix free text and itemized lists in any order, e.g.:
--   [
--     { "type": "text", "content": "Some paragraph..." },
--     { "type": "list", "items": ["Item one", "Item two"] },
--     { "type": "text", "content": "Closing paragraph..." }
--   ]
-- Bosses ("jefe/jefes") are proper names, not translated, and optional (0..N),
-- modeled as a child table so they can be added/removed independently.
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

CREATE TABLE IF NOT EXISTS experience_bosses (
    id            SERIAL PRIMARY KEY,
    experience_id INTEGER NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    name          VARCHAR(255) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_experience_bosses_experience_id ON experience_bosses (experience_id);

COMMENT ON TABLE experience_bosses IS 'Zero or more project managers/bosses ("jefe/jefes") linked to an experience. Names are proper nouns, not translated.';
