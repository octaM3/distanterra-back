-- Photos shown in the public "Galería" section, opened via the navbar and browsable
-- as a lightbox carousel. Files are stored on the VPS disk (see UPLOADS_DIR); this
-- table stores the relative path/URL and metadata.
-- Like images (partner logos), gallery photos are hard-deleted: when removed, both
-- the row and the underlying file on disk are deleted (no logical delete requirement).
CREATE TABLE IF NOT EXISTS gallery_images (
    id            SERIAL PRIMARY KEY,
    file_path     VARCHAR(500) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE gallery_images IS 'Photos shown in the public "Galería" section of the site.';
COMMENT ON COLUMN gallery_images.file_path IS 'Path relative to UPLOADS_DIR, e.g. gallery/uuid.jpg';
