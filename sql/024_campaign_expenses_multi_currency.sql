-- Los gastos extra ahora admiten monto en USD y/o en ARS (antes un único
-- "amount" implícitamente en USD, según el propio formulario lo etiquetaba),
-- más un número/ID de factura como texto libre (distinto de invoice_type,
-- que es la letra de factura AFIP).
ALTER TABLE campaign_expenses ADD COLUMN IF NOT EXISTS amount_usd NUMERIC(12,2);
ALTER TABLE campaign_expenses ADD COLUMN IF NOT EXISTS amount_ars NUMERIC(12,2);
ALTER TABLE campaign_expenses ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100);

-- El "amount" existente siempre fue en USD.
UPDATE campaign_expenses SET amount_usd = amount WHERE amount_usd IS NULL;

ALTER TABLE campaign_expenses DROP COLUMN IF EXISTS amount;

ALTER TABLE campaign_expenses DROP CONSTRAINT IF EXISTS chk_campaign_expenses_amount;
ALTER TABLE campaign_expenses ADD CONSTRAINT chk_campaign_expenses_amount CHECK (
    amount_usd IS NOT NULL OR amount_ars IS NOT NULL
);
