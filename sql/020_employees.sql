-- Empleados de Distanterra, con su documentación asociada: estudios médicos y
-- pólizas de seguro (ambos en tablas aparte porque son varios por empleado y
-- cada uno tiene su propia vigencia).
CREATE TABLE IF NOT EXISTS employees (
    id                      SERIAL PRIMARY KEY,
    full_name               VARCHAR(255) NOT NULL,
    dni                     VARCHAR(20) NOT NULL,
    birth_date              DATE NOT NULL,
    -- Fotos del DNI (frente y dorso): opcionales al crear, se suelen cargar
    -- después, igual que el resto de la documentación.
    dni_front_image_path    VARCHAR(500),
    dni_back_image_path     VARCHAR(500),
    -- EPP (equipo de protección personal): simple confirmación de que el
    -- empleado ya tiene su equipo, sin detalle de qué incluye.
    has_ppe                 BOOLEAN NOT NULL DEFAULT false,
    -- Situación laboral, catálogo fijo (mismo criterio que invoice_type en
    -- campaign_expenses: valores cerrados en vez de texto libre).
    employment_status       VARCHAR(30),
    bank_cvu                VARCHAR(50),
    bank_alias              VARCHAR(100),
    bank_holder             VARCHAR(255),
    -- Cuánto cobra por día: las dos monedas son independientes y opcionales,
    -- igual que los montos de los gastos extra de campaña.
    daily_rate_ars          NUMERIC(12,2),
    daily_rate_usd          NUMERIC(12,2),
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at              TIMESTAMPTZ,
    CONSTRAINT chk_employees_employment_status CHECK (
        employment_status IS NULL
        OR employment_status IN ('Monotributo', 'Mes de prueba', 'En blanco')
    ),
    CONSTRAINT chk_employees_daily_rate_ars CHECK (daily_rate_ars IS NULL OR daily_rate_ars >= 0),
    CONSTRAINT chk_employees_daily_rate_usd CHECK (daily_rate_usd IS NULL OR daily_rate_usd >= 0)
);

-- El DNI es único entre los empleados vigentes: un empleado dado de baja
-- (deleted_at) no bloquea volver a cargar a alguien con el mismo documento.
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_dni_unique ON employees (dni) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employees_not_deleted ON employees (deleted_at) WHERE deleted_at IS NULL;

-- Estudios médicos: duran un año, por eso interesa tanto la fecha en que se
-- hizo como la de vencimiento (no se calcula, se carga, porque la vigencia
-- real la define el estudio en sí).
CREATE TABLE IF NOT EXISTS employee_medical_exams (
    id              SERIAL PRIMARY KEY,
    employee_id     INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    exam_date       DATE NOT NULL,
    expires_at      DATE NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT chk_employee_medical_exams_dates CHECK (expires_at >= exam_date)
);

CREATE INDEX IF NOT EXISTS idx_employee_medical_exams_employee ON employee_medical_exams (employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_medical_exams_not_deleted ON employee_medical_exams (deleted_at) WHERE deleted_at IS NULL;

-- Pólizas de seguro: el tipo es texto libre (seguro de vida, incapacidad, u
-- otro) porque lo define la póliza contratada, no un catálogo nuestro.
CREATE TABLE IF NOT EXISTS employee_insurance_policies (
    id              SERIAL PRIMARY KEY,
    employee_id     INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    insurance_type  VARCHAR(255) NOT NULL,
    covered_from    DATE NOT NULL,
    covered_to      DATE NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT chk_employee_insurance_policies_dates CHECK (covered_to >= covered_from)
);

CREATE INDEX IF NOT EXISTS idx_employee_insurance_policies_employee ON employee_insurance_policies (employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_insurance_policies_not_deleted ON employee_insurance_policies (deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE employees IS 'Empleados de Distanterra: datos personales, EPP, situación laboral y datos bancarios para transferencias.';
COMMENT ON TABLE employee_medical_exams IS 'Estudios médicos de cada empleado (PDF), con fecha de realización y de vencimiento.';
COMMENT ON TABLE employee_insurance_policies IS 'Pólizas de seguro de cada empleado (PDF), con tipo de seguro y período de cobertura.';
