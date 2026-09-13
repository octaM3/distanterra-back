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
    -- Fecha de emisión (factura / nota de crédito) o del pago (recibo). El
    -- año que se usa para archivar sale de acá, no se carga aparte.
    document_date       DATE,
    -- Solo para el resumen del banco, como 'YYYY-MM': hay uno por mes.
    statement_month     VARCHAR(7),
    document_number     VARCHAR(100),
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

COMMENT ON TABLE financial_documents IS 'Repositorio de PDF administrativos: facturas emitidas, notas de crédito, recibos de pago y resúmenes mensuales del banco.';
