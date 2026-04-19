BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS payment_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    net_days INTEGER NOT NULL CHECK (net_days >= 0),
    discount_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_pct >= 0 AND discount_pct <= 100),
    discount_days INTEGER CHECK (discount_days IS NULL OR discount_days >= 0)
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    region VARCHAR(100),
    size_category VARCHAR(50),
    credit_limit NUMERIC(14,2) CHECK (credit_limit IS NULL OR credit_limit >= 0),
    avg_payment_days NUMERIC(8,2) CHECK (avg_payment_days IS NULL OR avg_payment_days >= 0),
    late_payment_ratio NUMERIC(5,4) CHECK (late_payment_ratio IS NULL OR (late_payment_ratio >= 0 AND late_payment_ratio <= 1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ml_model_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(150) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN ('classification', 'regression')),
    file_path TEXT NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    hyperparameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    trained_at TIMESTAMPTZ,
    deployed_at TIMESTAMPTZ,
    CONSTRAINT uq_ml_model_registry_name_version UNIQUE (model_name, model_version)
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    payment_term_id UUID NOT NULL REFERENCES payment_terms(id) ON DELETE RESTRICT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    actual_payment_date DATE,
    amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled')),
    category VARCHAR(100),
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_invoice_due_date CHECK (due_date >= issue_date),
    CONSTRAINT chk_invoice_payment_date CHECK (actual_payment_date IS NULL OR actual_payment_date >= issue_date),
    CONSTRAINT chk_invoice_currency_format CHECK (currency = UPPER(currency) AND char_length(currency) = 3)
);

CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES ml_model_registry(id) ON DELETE RESTRICT,
    will_be_delayed BOOLEAN NOT NULL,
    delay_probability NUMERIC(5,4) NOT NULL CHECK (delay_probability >= 0 AND delay_probability <= 1),
    predicted_delay_days INTEGER CHECK (predicted_delay_days IS NULL OR predicted_delay_days >= 0),
    feature_values JSONB NOT NULL DEFAULT '{}'::jsonb,
    shap_values JSONB NOT NULL DEFAULT '{}'::jsonb,
    predicted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount_paid NUMERIC(14,2) NOT NULL CHECK (amount_paid >= 0),
    payment_method VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS customer_risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    risk_score NUMERIC(5,4) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 1),
    risk_tier VARCHAR(20) NOT NULL CHECK (risk_tier IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    scored_at DATE NOT NULL
);

COMMIT;
