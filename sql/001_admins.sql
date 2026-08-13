-- Admin users table.
-- There is intentionally NO public registration endpoint: rows are created
-- only via the "npm run db:seed-admin" script or directly in the DB.
CREATE TABLE IF NOT EXISTS admins (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE admins IS 'Administrator accounts allowed to access the hidden admin panel.';
