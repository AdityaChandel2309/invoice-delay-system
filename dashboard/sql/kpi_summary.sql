-- ============================================================================
-- KPI SUMMARY — Metabase Executive Summary page
-- ============================================================================
-- Returns a single row with headline KPIs for the top-level dashboard cards.
-- Source views: delay_overview, customer_risk, model_performance
-- ============================================================================

SELECT
    -- ── Invoice volume ───────────────────────────────────────────────
    COUNT(*)                                            AS total_invoices,
    COUNT(*) FILTER (WHERE status = 'paid')             AS paid_invoices,
    COUNT(*) FILTER (WHERE is_currently_overdue)        AS overdue_invoices,
    COUNT(*) FILTER (WHERE status NOT IN ('paid', 'cancelled'))
                                                        AS open_invoices,

    -- ── Delay metrics ────────────────────────────────────────────────
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE actually_delayed)
             / NULLIF(COUNT(*) FILTER (WHERE actual_payment_date IS NOT NULL), 0),
        2
    )                                                   AS delay_rate_pct,
    ROUND(AVG(delay_days) FILTER (WHERE actually_delayed), 1)
                                                        AS avg_delay_days,
    MAX(delay_days)                                     AS max_delay_days,

    -- ── Financial exposure ───────────────────────────────────────────
    COALESCE(SUM(amount), 0)::NUMERIC(16,2)             AS total_invoiced_amount,
    COALESCE(SUM(outstanding_amount), 0)::NUMERIC(16,2) AS total_outstanding_amount,
    COALESCE(
        SUM(amount) FILTER (WHERE predicted_will_be_delayed),
        0
    )::NUMERIC(16,2)                                    AS total_at_risk_amount,

    -- ── Prediction coverage ──────────────────────────────────────────
    COUNT(prediction_id)                                AS invoices_with_predictions,
    ROUND(
        100.0 * COUNT(prediction_id) / NULLIF(COUNT(*), 0),
        1
    )                                                   AS prediction_coverage_pct,
    ROUND(AVG(delay_probability) FILTER (WHERE prediction_id IS NOT NULL), 4)
                                                        AS avg_delay_probability

FROM delay_overview;
