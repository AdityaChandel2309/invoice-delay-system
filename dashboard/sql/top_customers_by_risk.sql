-- ============================================================================
-- TOP CUSTOMERS BY RISK — Metabase Customer Risk page
-- ============================================================================
-- Top 20 customers ranked by a composite risk rank that blends:
--   • ML risk score
--   • Open invoice exposure
--   • Historical delay rate
-- Source view: customer_risk
-- ============================================================================

SELECT
    customer_id,
    customer_name,
    industry,
    region,
    size_category,
    credit_limit,

    -- Risk metrics
    risk_score,
    risk_tier,

    -- Invoice profile
    total_invoices,
    open_invoice_count,
    overdue_invoice_count,
    delayed_invoice_count,
    ROUND(
        100.0 * delayed_invoice_count / NULLIF(paid_invoice_count, 0),
        2
    )                                                  AS historical_delay_rate_pct,

    -- Financial exposure
    open_invoice_amount,
    invoiced_amount,
    ROUND(
        100.0 * open_invoice_amount / NULLIF(credit_limit, 0),
        2
    )                                                  AS credit_utilisation_pct,

    -- Payment behaviour
    avg_actual_payment_days,
    avg_delay_days,
    late_payment_ratio,

    -- Prediction stats
    avg_delay_probability,
    avg_predicted_delay_days,
    predicted_delayed_invoice_count,

    -- Composite risk rank  (lower = riskier)
    -- Weights: 40% risk_score, 30% open_exposure ratio, 30% delay rate
    RANK() OVER (
        ORDER BY
            (
                COALESCE(risk_score, 0) * 0.40
              + LEAST(COALESCE(open_invoice_amount, 0) / NULLIF(credit_limit, 1), 1.0) * 0.30
              + COALESCE(late_payment_ratio, 0) * 0.30
            ) DESC
    )                                                  AS composite_risk_rank

FROM customer_risk
WHERE total_invoices > 0
ORDER BY composite_risk_rank
LIMIT 20;
