-- ============================================================================
-- AGING BUCKETS — Metabase Delay Analysis page
-- ============================================================================
-- Summarises open receivables by aging bucket for the AR waterfall chart.
-- Source view: aging_buckets
-- ============================================================================

-- 1) Summary card — one row per bucket
SELECT
    aging_bucket,
    aging_bucket_sort_order,
    COUNT(*)                                           AS invoice_count,
    SUM(outstanding_amount)::NUMERIC(16,2)             AS total_outstanding,
    ROUND(AVG(days_past_due), 1)                       AS avg_days_past_due,
    ROUND(
        100.0 * SUM(outstanding_amount)
             / NULLIF(SUM(SUM(outstanding_amount)) OVER (), 0),
        2
    )                                                  AS pct_of_total_outstanding

FROM aging_buckets
GROUP BY aging_bucket, aging_bucket_sort_order
ORDER BY aging_bucket_sort_order;


-- 2) Detail table — individual invoices (for drill-through)
-- Uncomment to use as a second dataset in Metabase
/*
SELECT
    invoice_id,
    invoice_number,
    customer_id,
    customer_name,
    region,
    industry,
    category,
    currency,
    issue_date,
    due_date,
    amount,
    total_paid_amount,
    outstanding_amount,
    days_past_due,
    aging_bucket,
    aging_bucket_sort_order
FROM aging_buckets
ORDER BY days_past_due DESC;
*/
