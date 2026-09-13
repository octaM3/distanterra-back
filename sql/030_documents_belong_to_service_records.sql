-- Las facturas y los recibos dejan de ser documentos sueltos: pertenecen
-- siempre a un ítem de gestión (el servicio que se facturó / se cobró). Con
-- eso, el estado de facturación y de pago de la gestión deja de ser un tilde
-- manual y pasa a derivarse de los archivos cargados: hay factura => facturado,
-- hay recibo => cobrado. Así no puede existir un "facturado" sin respaldo.
--
-- Las notas de crédito siguen colgando de su factura (llegan al ítem de gestión
-- a través de ella) y el resumen del banco sigue siendo independiente.

ALTER TABLE financial_documents
    ADD COLUMN IF NOT EXISTS service_record_id INTEGER REFERENCES service_records(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_financial_documents_service_record
    ON financial_documents (service_record_id);

-- Un ítem de gestión se factura una sola vez y se cobra una sola vez.
CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_documents_one_invoice_per_record
    ON financial_documents (service_record_id)
    WHERE doc_type = 'factura' AND service_record_id IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_documents_one_receipt_per_record
    ON financial_documents (service_record_id)
    WHERE doc_type = 'recibo' AND service_record_id IS NOT NULL AND deleted_at IS NULL;

-- Facturas/recibos anteriores a esta estructura: se enlazan al ítem de gestión
-- de su misma empresa, solo cuando hay exactamente uno (si hay varios no se
-- puede adivinar cuál es, y quedan sin enlazar).
UPDATE financial_documents doc
SET service_record_id = (
    SELECT sr.id FROM service_records sr
    WHERE sr.company_id = doc.company_id AND sr.deleted_at IS NULL
)
WHERE doc.doc_type IN ('factura', 'recibo')
  AND doc.service_record_id IS NULL
  AND doc.deleted_at IS NULL
  AND (
    SELECT COUNT(*) FROM service_records sr
    WHERE sr.company_id = doc.company_id AND sr.deleted_at IS NULL
  ) = 1;

-- NOT VALID: las filas viejas que no se pudieron enlazar arriba quedan como
-- están (la migración no debe fallar por datos previos), pero todo alta o
-- edición posterior sí se valida.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_financial_documents_service_record'
    ) THEN
        ALTER TABLE financial_documents
            ADD CONSTRAINT chk_financial_documents_service_record CHECK (
                doc_type NOT IN ('factura', 'recibo') OR service_record_id IS NOT NULL
            ) NOT VALID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_financial_documents_no_service_record'
    ) THEN
        ALTER TABLE financial_documents
            ADD CONSTRAINT chk_financial_documents_no_service_record CHECK (
                doc_type NOT IN ('nota_credito', 'resumen_banco') OR service_record_id IS NULL
            ) NOT VALID;
    END IF;
END $$;

-- El estado ahora se deriva de los documentos, así que las columnas manuales
-- (y su CHECK cruzado) ya no van.
ALTER TABLE service_records DROP CONSTRAINT IF EXISTS chk_service_records_payment_needs_invoice;
ALTER TABLE service_records DROP COLUMN IF EXISTS invoice_sent;
ALTER TABLE service_records DROP COLUMN IF EXISTS invoice_sent_at;
ALTER TABLE service_records DROP COLUMN IF EXISTS payment_received;
ALTER TABLE service_records DROP COLUMN IF EXISTS payment_received_at;

COMMENT ON COLUMN financial_documents.service_record_id IS 'Ítem de gestión al que pertenece la factura o el recibo; NULL en notas de crédito (heredan el de su factura) y resúmenes del banco.';
