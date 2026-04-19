-- ============================================================================
-- PREDICTED DELAY DISTRIBUTION — Metabase Delay Analysis page
-- ============================================================================
-- Distribution of ML-predicted delay probabilities and days, bucketed
-- for histogram / bar chart visuals.
-- Source view: delay_overview
-- ============================================================================

-- 1) Probability distribution — bucketed in 10% bands
SELECT
    CASE
        WHEN delay_probability < 0.10 THEN '0–10%'
        WHEN delay_probability < 0.20 THEN '10–20%'
        WHEN delay_probability < 0.30 THEN '20–30%'
        WHEN delay_probability < 0.40 THEN '30–40%'
        WHEN delay_probability < 0.50 THEN '40–50%'
        WHEN delay_probability < 0.60 THEN '50–60%'
        WHEN delay_probability < 0.70 THEN '60–70%'
        WHEN delay_probability < 0.80 THEN '70–80%'
        WHEN delay_probability < 0.90 THEN '80–90%'
        ELSE '90–100%'
    END                                                AS probability_bucket,
    CASE
        WHEN delay_probability < 0.10 THEN 0
        WHEN delay_probability < 0.20 THEN 1
        WHEN delay_probability < 0.30 THEN 2
        WHEN delay_probability < 0.40 THEN 3
        WHEN delay_probability < 0.50 THEN 4
        WHEN delay_probability < 0.60 THEN 5
        WHEN delay_probability < 0.70 THEN 6
        WHEN delay_probability < 0.80 THEN 7
        WHEN delay_probability < 0.90 THEN 8
        ELSE 9
    END                                                AS bucket_sort,
    COUNT(*)                                           AS invoice_count,
    COALESCE(SUM(amount), 0)::NUMERIC(16,2)            AS total_amount,
    ROUND(AVG(predicted_delay_days), 1)                AS avg_predicted_days

FROM delay_overview
WHERE prediction_id IS NOT NULL
GROUP BY 1, 2
ORDER BY bucket_sort;


-- 2) Predicted delay-days distribution — bucketed in weekly bands
SELECT
    CASE
        WHEN predicted_delay_days = 0            THEN 'On Time'
        WHEN predicted_delay_days BETWEEN 1  AND 7  THEN '1–7 Days'
        WHEN predicted_delay_days BETWEEN 8  AND 14 THEN '8–14 Days'
        WHEN predicted_delay_days BETWEEN 15 AND 21 THEN '15–21 Days'
        WHEN predicted_delay_days BETWEEN 22 AND 30 THEN '22–30 Days'
        ELSE '30+ Days'
    END                                                AS delay_days_bucket,
    CASE
        WHEN predicted_delay_days = 0            THEN 0
        WHEN predicted_delay_days BETWEEN 1  AND 7  THEN 1
        WHEN predicted_delay_days BETWEEN 8  AND 14 THEN 2
        WHEN predicted_delay_days BETWEEN 15 AND 21 THEN 3
        WHEN predicted_delay_days BETWEEN 22 AND 30 THEN 4
        ELSE 5
    END                                                AS bucket_sort,
    COUNT(*)                                           AS invoice_count,
    COALESCE(SUM(amount), 0)::NUMERIC(16,2)            AS total_amount,
    ROUND(AVG(delay_probability), 4)                   AS avg_probability

FROM delay_overview
WHERE prediction_id IS NOT NULL
GROUP BY 1, 2
ORDER BY bucket_sort;
