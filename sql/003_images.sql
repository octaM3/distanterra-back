-- Company/partner logos shown at the bottom of the landing page ("Confian en nosotros" / "Trust us").
-- Files are stored on the VPS disk (see UPLOADS_DIR); this table stores the relative path/URL and metadata.
-- Unlike comments/experiences, images are hard-deleted: when removed, both the
-- row and the underlying file on disk are deleted (no logical delete requirement).
CREATE TABLE IF NOT EXISTS images (
    id            SERIAL PRIMARY KEY,
    file_path     VARCHAR(500) NOT NULL,
    alt_text_es   VARCHAR(255),
    alt_text_en   VARCHAR(255),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE images IS 'Partner/client logos shown in the "Trust Us" section of the landing page.';
COMMENT ON COLUMN images.file_path IS 'Path relative to UPLOADS_DIR, e.g. logos/uuid.png';
