-- ============================================================================
-- MONTHLY DELAY TREND — Metabase Trend & Forecast page
-- ============================================================================
-- Aggregates delay metrics by month across all regions/industries.
-- Use Metabase filters on region, industry, currency, category for drill-down.
-- Source view: trend_analysis
-- ============================================================================

SELECT
    trend_month,
    region,
    industry,
    category,
    currency,

    -- Volume
    SUM(total_invoices)                             AS total_invoices,
    SUM(delayed_invoices)                           AS delayed_invoices,
    SUM(currently_overdue_invoices)                 AS currently_overdue_invoices,
    ROUND(
        100.0 * SUM(delayed_invoices)
             / NULLIF(SUM(total_invoices), 0),
        2
    )                                               AS delay_rate_pct,

    -- Financials
    SUM(invoiced_amount)::NUMERIC(16,2)             AS invoiced_amount,
    SUM(delayed_amount)::NUMERIC(16,2)              AS delayed_amount,
    SUM(overdue_open_amount)::NUMERIC(16,2)         AS overdue_open_amount,

    -- Actuals
    ROUND(
        SUM(avg_delay_days * total_invoices)
        / NULLIF(SUM(total_invoices), 0),
        2
    )                                               AS weighted_avg_delay_days,

    -- Predictions
    SUM(predicted_invoices)                         AS predicted_invoices,
    SUM(predicted_delayed_invoices)                 AS predicted_delayed_invoices,
    ROUND(
        SUM(avg_delay_probability * predicted_invoices)
        / NULLIF(SUM(predicted_invoices), 0),
        4
    )                                               AS weighted_avg_delay_probability,
    ROUND(
        SUM(avg_predicted_delay_days * predicted_invoices)
        / NULLIF(SUM(predicted_invoices), 0),
        2
    )                                               AS weighted_avg_predicted_delay_days

FROM trend_analysis
GROUP BY
    trend_month,
    region,
    industry,
    category,
    currency
ORDER BY trend_month DESC;
