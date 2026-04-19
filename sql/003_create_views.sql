BEGIN;

DROP VIEW IF EXISTS model_performance;
DROP VIEW IF EXISTS aging_buckets;
DROP VIEW IF EXISTS trend_analysis;
DROP VIEW IF EXISTS customer_risk;
DROP VIEW IF EXISTS delay_overview;

CREATE VIEW delay_overview AS
WITH latest_predictions AS (
    SELECT
        p.invoice_id,
        p.id AS prediction_id,
        p.model_id,
        p.will_be_delayed,
        p.delay_probability,
        p.predicted_delay_days,
        p.predicted_at,
        ROW_NUMBER() OVER (
            PARTITION BY p.invoice_id
            ORDER BY p.predicted_at DESC, p.id DESC
        ) AS rn
    FROM predictions p
),
latest_customer_risk AS (
    SELECT
        crs.customer_id,
        crs.risk_score,
        crs.risk_tier,
        crs.scored_at,
        ROW_NUMBER() OVER (
            PARTITION BY crs.customer_id
            ORDER BY crs.scored_at DESC, crs.id DESC
        ) AS rn
    FROM customer_risk_scores crs
)
SELECT
    i.id AS invoice_id,
    i.invoice_number,
    i.issue_date,
    i.due_date,
    i.actual_payment_date,
    i.status,
    i.amount,
    i.currency,
    i.category,
    i.is_recurring,
    c.id AS customer_id,
    c.name AS customer_name,
    c.industry,
    c.region,
    c.size_category,
    pt.id AS payment_term_id,
    pt.name AS payment_term_name,
    pt.net_days,
    COALESCE(lp.prediction_id, NULL) AS prediction_id,
    lp.model_id,
    lp.will_be_delayed AS predicted_will_be_delayed,
    lp.delay_probability,
    lp.predicted_delay_days,
    lp.predicted_at,
    lcr.risk_score AS current_risk_score,
    lcr.risk_tier AS current_risk_tier,
    (i.actual_payment_date IS NOT NULL AND i.actual_payment_date > i.due_date) AS actually_delayed,
    CASE
        WHEN i.actual_payment_date IS NOT NULL THEN GREATEST(i.actual_payment_date - i.due_date, 0)
        ELSE GREATEST(CURRENT_DATE - i.due_date, 0)
    END AS delay_days,
    CASE
        WHEN i.actual_payment_date IS NULL THEN GREATEST(CURRENT_DATE - i.issue_date, 0)
        ELSE GREATEST(i.actual_payment_date - i.issue_date, 0)
    END AS invoice_age_days,
    CASE
        WHEN i.actual_payment_date IS NULL THEN GREATEST(i.amount - COALESCE(ph.total_paid_amount, 0), 0)
        ELSE 0::NUMERIC(14,2)
    END AS outstanding_amount,
    CASE
        WHEN i.actual_payment_date IS NULL AND i.due_date < CURRENT_DATE THEN TRUE
        ELSE FALSE
    END AS is_currently_overdue
FROM invoices i
JOIN customers c
    ON c.id = i.customer_id
JOIN payment_terms pt
    ON pt.id = i.payment_term_id
LEFT JOIN (
    SELECT *
    FROM latest_predictions
    WHERE rn = 1
) lp
    ON lp.invoice_id = i.id
LEFT JOIN (
    SELECT *
    FROM latest_customer_risk
    WHERE rn = 1
) lcr
    ON lcr.customer_id = c.id
LEFT JOIN (
    SELECT
        invoice_id,
        SUM(amount_paid) AS total_paid_amount
    FROM payment_history
    GROUP BY invoice_id
) ph
    ON ph.invoice_id = i.id;

CREATE VIEW customer_risk AS
WITH latest_customer_risk AS (
    SELECT
        crs.customer_id,
        crs.risk_score,
        crs.risk_tier,
        crs.scored_at,
        ROW_NUMBER() OVER (
            PARTITION BY crs.customer_id
            ORDER BY crs.scored_at DESC, crs.id DESC
        ) AS rn
    FROM customer_risk_scores crs
),
customer_invoice_stats AS (
    SELECT
        i.customer_id,
        COUNT(*) AS total_invoices,
        COUNT(*) FILTER (WHERE i.actual_payment_date IS NOT NULL) AS paid_invoice_count,
        COUNT(*) FILTER (WHERE i.actual_payment_date IS NOT NULL AND i.actual_payment_date > i.due_date) AS delayed_invoice_count,
        COUNT(*) FILTER (WHERE i.actual_payment_date IS NULL) AS open_invoice_count,
        COUNT(*) FILTER (WHERE i.actual_payment_date IS NULL AND i.due_date < CURRENT_DATE) AS overdue_invoice_count,
        COALESCE(SUM(i.amount), 0)::NUMERIC(14,2) AS invoiced_amount,
        COALESCE(SUM(i.amount) FILTER (WHERE i.actual_payment_date IS NULL), 0)::NUMERIC(14,2) AS open_invoice_amount,
        COALESCE(AVG(GREATEST(i.actual_payment_date - i.issue_date, 0)) FILTER (WHERE i.actual_payment_date IS NOT NULL), 0)::NUMERIC(10,2) AS avg_actual_payment_days,
        COALESCE(AVG(GREATEST(i.actual_payment_date - i.due_date, 0)) FILTER (WHERE i.actual_payment_date IS NOT NULL), 0)::NUMERIC(10,2) AS avg_delay_days
    FROM invoices i
    GROUP BY i.customer_id
),
latest_predictions AS (
    SELECT
        p.invoice_id,
        p.will_be_delayed,
        p.delay_probability,
        p.predicted_delay_days,
        p.predicted_at,
        ROW_NUMBER() OVER (
            PARTITION BY p.invoice_id
            ORDER BY p.predicted_at DESC, p.id DESC
        ) AS rn
    FROM predictions p
),
customer_prediction_stats AS (
    SELECT
        i.customer_id,
        COUNT(lp.invoice_id) AS predicted_invoice_count,
        COUNT(lp.invoice_id) FILTER (WHERE lp.will_be_delayed) AS predicted_delayed_invoice_count,
        COALESCE(AVG(lp.delay_probability), 0)::NUMERIC(10,4) AS avg_delay_probability,
        COALESCE(AVG(lp.predicted_delay_days), 0)::NUMERIC(10,2) AS avg_predicted_delay_days,
        MAX(lp.predicted_at) AS latest_prediction_at
    FROM invoices i
    LEFT JOIN (
        SELECT *
        FROM latest_predictions
        WHERE rn = 1
    ) lp
        ON lp.invoice_id = i.id
    GROUP BY i.customer_id
)
SELECT
    c.id AS customer_id,
    c.name AS customer_name,
    c.industry,
    c.region,
    c.size_category,
    c.credit_limit,
    c.avg_payment_days,
    c.late_payment_ratio,
    lcr.risk_score,
    lcr.risk_tier,
    lcr.scored_at AS risk_scored_at,
    cis.total_invoices,
    cis.paid_invoice_count,
    cis.delayed_invoice_count,
    cis.open_invoice_count,
    cis.overdue_invoice_count,
    cis.invoiced_amount,
    cis.open_invoice_amount,
    cis.avg_actual_payment_days,
    cis.avg_delay_days,
    cps.predicted_invoice_count,
    cps.predicted_delayed_invoice_count,
    cps.avg_delay_probability,
    cps.avg_predicted_delay_days,
    cps.latest_prediction_at
FROM customers c
LEFT JOIN (
    SELECT *
    FROM latest_customer_risk
    WHERE rn = 1
) lcr
    ON lcr.customer_id = c.id
LEFT JOIN customer_invoice_stats cis
    ON cis.customer_id = c.id
LEFT JOIN customer_prediction_stats cps
    ON cps.customer_id = c.id;

CREATE VIEW trend_analysis AS
WITH latest_predictions AS (
    SELECT
        p.invoice_id,
        p.model_id,
        p.will_be_delayed,
        p.delay_probability,
        p.predicted_delay_days,
        p.predicted_at,
        ROW_NUMBER() OVER (
            PARTITION BY p.invoice_id
            ORDER BY p.predicted_at DESC, p.id DESC
        ) AS rn
    FROM predictions p
)
SELECT
    DATE_TRUNC('month', i.issue_date)::DATE AS trend_month,
    c.region,
    c.industry,
    i.currency,
    i.category,
    COUNT(*) AS total_invoices,
    COUNT(*) FILTER (WHERE i.actual_payment_date IS NOT NULL AND i.actual_payment_date > i.due_date) AS delayed_invoices,
    COUNT(*) FILTER (WHERE i.actual_payment_date IS NULL AND i.due_date < CURRENT_DATE) AS currently_overdue_invoices,
    COALESCE(SUM(i.amount), 0)::NUMERIC(16,2) AS invoiced_amount,
    COALESCE(SUM(i.amount) FILTER (WHERE i.actual_payment_date IS NOT NULL AND i.actual_payment_date > i.due_date), 0)::NUMERIC(16,2) AS delayed_amount,
    COALESCE(SUM(i.amount) FILTER (WHERE i.actual_payment_date IS NULL AND i.due_date < CURRENT_DATE), 0)::NUMERIC(16,2) AS overdue_open_amount,
    COALESCE(AVG(GREATEST(i.actual_payment_date - i.due_date, 0)) FILTER (WHERE i.actual_payment_date IS NOT NULL), 0)::NUMERIC(10,2) AS avg_delay_days,
    COUNT(lp.invoice_id) AS predicted_invoices,
    COUNT(lp.invoice_id) FILTER (WHERE lp.will_be_delayed) AS predicted_delayed_invoices,
    COALESCE(AVG(lp.delay_probability), 0)::NUMERIC(10,4) AS avg_delay_probability,
    COALESCE(AVG(lp.predicted_delay_days), 0)::NUMERIC(10,2) AS avg_predicted_delay_days
FROM invoices i
JOIN customers c
    ON c.id = i.customer_id
LEFT JOIN (
    SELECT *
    FROM latest_predictions
    WHERE rn = 1
) lp
    ON lp.invoice_id = i.id
GROUP BY
    DATE_TRUNC('month', i.issue_date)::DATE,
    c.region,
    c.industry,
    i.currency,
    i.category;

CREATE VIEW aging_buckets AS
WITH payment_totals AS (
    SELECT
        invoice_id,
        SUM(amount_paid) AS total_paid_amount
    FROM payment_history
    GROUP BY invoice_id
)
SELECT
    i.id AS invoice_id,
    i.invoice_number,
    c.id AS customer_id,
    c.name AS customer_name,
    c.region,
    c.industry,
    i.currency,
    i.category,
    i.status,
    i.issue_date,
    i.due_date,
    i.amount,
    COALESCE(ptot.total_paid_amount, 0)::NUMERIC(14,2) AS total_paid_amount,
    GREATEST(i.amount - COALESCE(ptot.total_paid_amount, 0), 0)::NUMERIC(14,2) AS outstanding_amount,
    GREATEST(CURRENT_DATE - i.due_date, 0) AS days_past_due,
    CASE
        WHEN i.due_date >= CURRENT_DATE THEN 'Current'
        WHEN CURRENT_DATE - i.due_date BETWEEN 1 AND 30 THEN '1-30 Days'
        WHEN CURRENT_DATE - i.due_date BETWEEN 31 AND 60 THEN '31-60 Days'
        WHEN CURRENT_DATE - i.due_date BETWEEN 61 AND 90 THEN '61-90 Days'
        ELSE '90+ Days'
    END AS aging_bucket,
    CASE
        WHEN i.due_date >= CURRENT_DATE THEN 0
        WHEN CURRENT_DATE - i.due_date BETWEEN 1 AND 30 THEN 1
        WHEN CURRENT_DATE - i.due_date BETWEEN 31 AND 60 THEN 2
        WHEN CURRENT_DATE - i.due_date BETWEEN 61 AND 90 THEN 3
        ELSE 4
    END AS aging_bucket_sort_order
FROM invoices i
JOIN customers c
    ON c.id = i.customer_id
LEFT JOIN payment_totals ptot
    ON ptot.invoice_id = i.id
WHERE i.actual_payment_date IS NULL
  AND GREATEST(i.amount - COALESCE(ptot.total_paid_amount, 0), 0) > 0;

CREATE VIEW model_performance AS
WITH latest_predictions AS (
    SELECT
        p.id AS prediction_id,
        p.invoice_id,
        p.model_id,
        p.will_be_delayed,
        p.delay_probability,
        p.predicted_delay_days,
        p.predicted_at,
        ROW_NUMBER() OVER (
            PARTITION BY p.invoice_id
            ORDER BY p.predicted_at DESC, p.id DESC
        ) AS rn
    FROM predictions p
),
resolved_predictions AS (
    SELECT
        lp.prediction_id,
        lp.invoice_id,
        lp.model_id,
        lp.will_be_delayed,
        lp.delay_probability,
        lp.predicted_delay_days,
        lp.predicted_at,
        i.actual_payment_date,
        i.due_date,
        CASE
            WHEN i.actual_payment_date IS NOT NULL AND i.actual_payment_date > i.due_date THEN TRUE
            ELSE FALSE
        END AS actual_was_delayed,
        CASE
            WHEN i.actual_payment_date IS NOT NULL THEN GREATEST(i.actual_payment_date - i.due_date, 0)
            ELSE NULL
        END AS actual_delay_days
    FROM latest_predictions lp
    JOIN invoices i
        ON i.id = lp.invoice_id
    WHERE lp.rn = 1
)
SELECT
    m.id AS model_id,
    m.model_name,
    m.model_version,
    m.model_type,
    m.is_active,
    m.trained_at,
    m.deployed_at,
    m.metrics,
    m.hyperparameters,
    NULLIF(m.metrics ->> 'f1_score', '')::NUMERIC(10,4) AS training_f1_score,
    NULLIF(m.metrics ->> 'precision', '')::NUMERIC(10,4) AS training_precision,
    NULLIF(m.metrics ->> 'recall', '')::NUMERIC(10,4) AS training_recall,
    NULLIF(m.metrics ->> 'auc_roc', '')::NUMERIC(10,4) AS training_auc_roc,
    NULLIF(m.metrics ->> 'pr_auc', '')::NUMERIC(10,4) AS training_pr_auc,
    NULLIF(m.metrics ->> 'mae', '')::NUMERIC(10,4) AS training_mae,
    NULLIF(m.metrics ->> 'rmse', '')::NUMERIC(10,4) AS training_rmse,
    NULLIF(m.metrics ->> 'r2', '')::NUMERIC(10,4) AS training_r2,
    COUNT(rp.prediction_id) AS live_predictions_scored,
    COUNT(rp.prediction_id) FILTER (WHERE rp.actual_payment_date IS NOT NULL) AS resolved_predictions,
    COUNT(rp.prediction_id) FILTER (
        WHERE rp.actual_payment_date IS NOT NULL
          AND rp.will_be_delayed = TRUE
          AND rp.actual_was_delayed = TRUE
    ) AS true_positives,
    COUNT(rp.prediction_id) FILTER (
        WHERE rp.actual_payment_date IS NOT NULL
          AND rp.will_be_delayed = TRUE
          AND rp.actual_was_delayed = FALSE
    ) AS false_positives,
    COUNT(rp.prediction_id) FILTER (
        WHERE rp.actual_payment_date IS NOT NULL
          AND rp.will_be_delayed = FALSE
          AND rp.actual_was_delayed = FALSE
    ) AS true_negatives,
    COUNT(rp.prediction_id) FILTER (
        WHERE rp.actual_payment_date IS NOT NULL
          AND rp.will_be_delayed = FALSE
          AND rp.actual_was_delayed = TRUE
    ) AS false_negatives,
    COALESCE(AVG(rp.delay_probability), 0)::NUMERIC(10,4) AS avg_live_delay_probability,
    COALESCE(AVG(rp.predicted_delay_days), 0)::NUMERIC(10,2) AS avg_predicted_delay_days,
    COALESCE(AVG(rp.actual_delay_days), 0)::NUMERIC(10,2) AS avg_actual_delay_days,
    COALESCE(AVG(ABS(rp.predicted_delay_days - rp.actual_delay_days)) FILTER (
        WHERE rp.actual_payment_date IS NOT NULL
          AND rp.predicted_delay_days IS NOT NULL
          AND rp.actual_delay_days IS NOT NULL
    ), 0)::NUMERIC(10,2) AS live_mae_delay_days,
    MAX(rp.predicted_at) AS latest_prediction_at
FROM ml_model_registry m
LEFT JOIN resolved_predictions rp
    ON rp.model_id = m.id
GROUP BY
    m.id,
    m.model_name,
    m.model_version,
    m.model_type,
    m.is_active,
    m.trained_at,
    m.deployed_at,
    m.metrics,
    m.hyperparameters;

COMMIT;
