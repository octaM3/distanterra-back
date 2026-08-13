-- Client testimonials/comments shown on the landing page.
-- Bilingual content: comment_es / comment_en.
-- Soft delete via deleted_at (never physically removed).
CREATE TABLE IF NOT EXISTS comments (
    id           SERIAL PRIMARY KEY,
    client_name  VARCHAR(150) NOT NULL,
    photo_url    VARCHAR(500),
    comment_es   TEXT NOT NULL,
    comment_en   TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active    BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_comments_not_deleted ON comments (deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE comments IS 'Client testimonials/comments displayed on the landing page.';
COMMENT ON COLUMN comments.deleted_at IS 'Soft delete marker. NULL = active row.';
