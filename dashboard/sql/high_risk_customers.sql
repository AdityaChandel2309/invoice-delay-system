-- ============================================================================
-- HIGH RISK CUSTOMERS — Metabase Customer Risk page
-- ============================================================================
-- Customers in HIGH or CRITICAL risk tiers, ranked by risk score descending.
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
    risk_scored_at,

    -- Invoice stats
    total_invoices,
    delayed_invoice_count,
    overdue_invoice_count,
    open_invoice_count,
    ROUND(
        100.0 * delayed_invoice_count / NULLIF(paid_invoice_count, 0),
        2
    )                                              AS actual_delay_rate_pct,

    -- Financial exposure
    invoiced_amount,
    open_invoice_amount,
    avg_actual_payment_days,
    avg_delay_days,

    -- ML prediction stats
    avg_delay_probability,
    avg_predicted_delay_days,
    predicted_delayed_invoice_count,
    latest_prediction_at

FROM customer_risk
WHERE risk_tier IN ('HIGH', 'CRITICAL')
ORDER BY risk_score DESC
LIMIT 50;
