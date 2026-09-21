-- Repositorio de archivos administrativos (siempre PDF): facturas emitidas a
-- las empresas, notas de crédito que corrigen una factura, recibos de los
-- pagos recibidos y el resumen mensual del banco.
--
-- Una sola tabla con discriminador en vez de cuatro: todos comparten la misma
-- forma (un PDF + metadatos + fecha), y lo propio de cada tipo queda
-- garantizado por los CHECK de abajo.
CREATE TABLE IF NOT EXISTS financial_documents (
    id                  SERIAL PRIMARY KEY,
    doc_type            VARCHAR(20) NOT NULL,
    -- Empresa a la que se le emitió la factura / de la que se recibió el pago.
    -- Las notas de crédito la heredan de su factura; el resumen del banco no
    -- tiene empresa.
    company_id          INTEGER REFERENCES companies(id) ON DELETE RESTRICT,
    -- Solo para notas de crédito: la factura a la que pertenecen. RESTRICT
    -- para que no se pueda borrar una factura dejando la nota huérfana.
    invoice_id          INTEGER REFERENCES financial_documents(id) ON DELETE RESTRICT,
    -- Facturas y recibos no son documentos sueltos: pertenecen al ítem de
    -- gestión del servicio que se facturó o se cobró, y de ahí sale su estado.
    -- Las notas de crédito llegan al ítem a través de su factura y el resumen
    -- del banco es independiente, así que en esos dos va NULL.
    service_record_id   INTEGER REFERENCES service_records(id) ON DELETE RESTRICT,
    -- Fecha de emisión (factura / nota de crédito) o del pago (recibo). El
    -- año que se usa para archivar sale de acá, no se carga aparte.
    document_date       DATE,
    -- Solo para el resumen del banco, como 'YYYY-MM': hay uno por mes.
    statement_month     VARCHAR(7),
    document_number     VARCHAR(100),
    -- Monto facturado / cobrado, para poder ver cuánto falta cobrar y no solo
    -- si se cobró. Nullable acá porque las notas de crédito y el resumen del
    -- banco no lo usan; para facturas y recibos lo exige el service
    -- (FinancialDocumentsService.applyTypeRules).
    amount              NUMERIC(12,2),
    currency            VARCHAR(3),
    description         VARCHAR(255),
    notes               TEXT,
    file_path           VARCHAR(500) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ,
    CONSTRAINT chk_financial_documents_type CHECK (
        doc_type IN ('factura', 'nota_credito', 'recibo', 'resumen_banco')
    ),
    -- Facturas y recibos son siempre de una empresa concreta.
    CONSTRAINT chk_financial_documents_company CHECK (
        doc_type NOT IN ('factura', 'recibo') OR company_id IS NOT NULL
    ),
    -- Una nota de crédito no existe suelta: corrige una factura.
    CONSTRAINT chk_financial_documents_credit_note CHECK (
        doc_type <> 'nota_credito' OR invoice_id IS NOT NULL
    ),
    -- El resumen del banco es propio, no de una empresa ni de una factura.
    CONSTRAINT chk_financial_documents_bank_statement CHECK (
        doc_type <> 'resumen_banco'
        OR (statement_month IS NOT NULL AND company_id IS NULL AND invoice_id IS NULL)
    ),
    CONSTRAINT chk_financial_documents_date CHECK (
        doc_type = 'resumen_banco' OR document_date IS NOT NULL
    ),
    CONSTRAINT chk_financial_documents_statement_month CHECK (
        statement_month IS NULL OR statement_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'
    ),
    CONSTRAINT chk_financial_documents_amount CHECK (amount IS NULL OR amount >= 0),
    CONSTRAINT chk_financial_documents_currency CHECK (
        currency IS NULL OR currency IN ('ARS', 'USD')
    ),
    -- Facturas y recibos siempre cuelgan de un ítem de gestión...
    CONSTRAINT chk_financial_documents_service_record CHECK (
        doc_type NOT IN ('factura', 'recibo') OR service_record_id IS NOT NULL
    ),
    -- ...y los otros dos tipos nunca.
    CONSTRAINT chk_financial_documents_no_service_record CHECK (
        doc_type NOT IN ('nota_credito', 'resumen_banco') OR service_record_id IS NULL
    )
);

-- "Sí o sí uno solo por mes": un único resumen de banco vigente por mes (uno
-- eliminado no bloquea volver a cargarlo).
CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_documents_bank_statement_month
    ON financial_documents (statement_month)
    WHERE doc_type = 'resumen_banco' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_financial_documents_not_deleted ON financial_documents (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_financial_documents_type ON financial_documents (doc_type);
CREATE INDEX IF NOT EXISTS idx_financial_documents_company ON financial_documents (company_id);
CREATE INDEX IF NOT EXISTS idx_financial_documents_invoice ON financial_documents (invoice_id);
CREATE INDEX IF NOT EXISTS idx_financial_documents_service_record ON financial_documents (service_record_id);

-- Un ítem de gestión se factura una sola vez y se cobra una sola vez.
CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_documents_one_invoice_per_record
    ON financial_documents (service_record_id)
    WHERE doc_type = 'factura' AND service_record_id IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_documents_one_receipt_per_record
    ON financial_documents (service_record_id)
    WHERE doc_type = 'recibo' AND service_record_id IS NOT NULL AND deleted_at IS NULL;

COMMENT ON TABLE financial_documents IS 'Repositorio de PDF administrativos: facturas emitidas, notas de crédito, recibos de pago y resúmenes mensuales del banco.';
COMMENT ON COLUMN financial_documents.service_record_id IS 'Ítem de gestión al que pertenece la factura o el recibo; NULL en notas de crédito (heredan el de su factura) y resúmenes del banco.';
