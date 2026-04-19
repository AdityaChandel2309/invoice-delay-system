-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
-- Run after 001_create_tables.sql.  All indexes use IF NOT EXISTS so this
-- script is safe to re-run.
-- ============================================================================

BEGIN;

-- ── Invoices ─────────────────────────────────────────────────────────

-- Most dashboard queries filter or sort by issue_date
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date
    ON invoices (issue_date DESC);

-- Common filters: status, customer, due_date
CREATE INDEX IF NOT EXISTS idx_invoices_status
    ON invoices (status);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_id
    ON invoices (customer_id);

CREATE INDEX IF NOT EXISTS idx_invoices_due_date
    ON invoices (due_date);

-- Composite index for overdue lookups (status = 'overdue' or past-due detection)
CREATE INDEX IF NOT EXISTS idx_invoices_status_due_date
    ON invoices (status, due_date);

-- For monthly trend queries that group by month
CREATE INDEX IF NOT EXISTS idx_invoices_issue_month
    ON invoices (DATE_TRUNC('month', issue_date));


-- ── Predictions ──────────────────────────────────────────────────────

-- Join on invoice_id + ordering by predicted_at (latest prediction)
CREATE INDEX IF NOT EXISTS idx_predictions_invoice_id
    ON predictions (invoice_id, predicted_at DESC);

-- Filter by model for performance metrics
CREATE INDEX IF NOT EXISTS idx_predictions_model_id
    ON predictions (model_id);

-- Filter high-risk predictions
CREATE INDEX IF NOT EXISTS idx_predictions_probability
    ON predictions (delay_probability DESC);


-- ── Payment History ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_payment_history_invoice_id
    ON payment_history (invoice_id);

CREATE INDEX IF NOT EXISTS idx_payment_history_payment_date
    ON payment_history (payment_date DESC);


-- ── Customer Risk Scores ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_customer_risk_scores_customer_id
    ON customer_risk_scores (customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_risk_scores_tier
    ON customer_risk_scores (risk_tier);

CREATE INDEX IF NOT EXISTS idx_customer_risk_scores_score
    ON customer_risk_scores (risk_score DESC);


-- ── Customers ────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_customers_industry
    ON customers (industry);

CREATE INDEX IF NOT EXISTS idx_customers_region
    ON customers (region);

-- Full-text-like search on customer name (trigram would be better, but
-- this covers simple ILIKE queries)
CREATE INDEX IF NOT EXISTS idx_customers_name
    ON customers (name);


-- ── ML Model Registry ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_ml_model_registry_active
    ON ml_model_registry (is_active)
    WHERE is_active = TRUE;

COMMIT;
