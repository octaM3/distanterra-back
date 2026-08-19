-- Contact requests submitted from the public site (footer form and /contact page,
-- both render the same ContactForm component). Previously these went straight to a
-- Google Form; now they're persisted here so the admin panel can show them.
-- is_read acts as the "new request" notification flag: false until an admin opens
-- the message's detail in the admin panel, at which point it flips to true.
CREATE TABLE IF NOT EXISTS contact_messages (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    company    VARCHAR(150) NOT NULL,
    phone      VARCHAR(50),
    email      VARCHAR(255) NOT NULL,
    message    TEXT,
    is_read    BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON contact_messages (is_read) WHERE is_read = false;

COMMENT ON TABLE contact_messages IS 'Contact form submissions from the public site (footer + /contact page).';
COMMENT ON COLUMN contact_messages.is_read IS 'Notification flag: false = new/unread, set true when an admin views the message.';
