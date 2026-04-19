# Power BI Dashboard — Design & Configuration Guide

## 1. Overview

The dashboard connects to a **PostgreSQL** database via DirectQuery (or Scheduled Import) and reads from five pre-built database views and six Power BI–specific SQL query files.

| Database View | Purpose |
|---|---|
| `delay_overview` | One row per invoice with prediction, customer, and payment details |
| `customer_risk` | One row per customer with invoice stats, risk score, and prediction stats |
| `trend_analysis` | Monthly aggregates by region / industry / category / currency |
| `aging_buckets` | Open invoices bucketed by days past due |
| `model_performance` | Live model metrics (confusion matrix, MAE, etc.) per registered model |

| Query File | Feeds Page |
|---|---|
| `kpi_summary.sql` | Executive Summary |
| `monthly_delay_trend.sql` | Trend & Forecast |
| `aging_buckets.sql` | Delay Analysis |
| `predicted_delay_distribution.sql` | Delay Analysis |
| `high_risk_customers.sql` | Customer Risk |
| `top_customers_by_risk.sql` | Customer Risk |

---

## 2. Dashboard Pages

```
┌──────────────────────────────────────────────────────────────────────┐
│  📊 Executive Summary                                               │
│  📈 Trend & Forecast                                                │
│  🔍 Delay Analysis                                                  │
│  ⚠️  Customer Risk                                                   │
│  🤖 Prediction Performance                                          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Page 1 — Executive Summary

### Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  [KPI Card]    [KPI Card]    [KPI Card]    [KPI Card]             │
│  Total         Delay Rate    Avg Delay     At-Risk                │
│  Invoices      %             Days          Amount                 │
├────────────────────────────────┬───────────────────────────────────┤
│                                │                                   │
│   Monthly Delay Trend          │   Risk Tier Distribution          │
│   (Line Chart)                 │   (Donut Chart)                   │
│                                │                                   │
├────────────────────────────────┴───────────────────────────────────┤
│                                                                    │
│   Top Overdue Invoices (Table)                                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Visuals

| # | Visual | Chart Type | Data Source | Fields |
|---|---|---|---|---|
| 1 | Total Invoices | KPI Card | `kpi_summary.sql` | `total_invoices` |
| 2 | Delay Rate % | KPI Card | `kpi_summary.sql` | `delay_rate_pct` |
| 3 | Avg Delay Days | KPI Card | `kpi_summary.sql` | `avg_delay_days` |
| 4 | At-Risk Amount | KPI Card | `kpi_summary.sql` | `total_at_risk_amount` (format: currency) |
| 5 | Monthly Delay Trend | Line Chart | `monthly_delay_trend.sql` | X: `trend_month`, Y: `delay_rate_pct`, secondary Y: `total_invoices` |
| 6 | Risk Tier Distribution | Donut Chart | `customer_risk` view | Legend: `risk_tier`, Values: count of `customer_id` |
| 7 | Top Overdue Invoices | Table | `delay_overview` view | Columns: `invoice_number`, `customer_name`, `amount`, `due_date`, `delay_days`, `delay_probability` — filtered to `is_currently_overdue = TRUE`, sorted by `amount DESC` |

---

## 4. Page 2 — Trend & Forecast

### Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  [Slicer: Region]  [Slicer: Industry]  [Slicer: Date Range]      │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   Delay Rate Over Time (Area Chart)                                │
│                                                                    │
├────────────────────────────────┬───────────────────────────────────┤
│                                │                                   │
│   Delayed vs Total Invoices    │   At-Risk Amount Trend            │
│   (Clustered Bar Chart)        │   (Line Chart)                    │
│                                │                                   │
├────────────────────────────────┴───────────────────────────────────┤
│                                                                    │
│   Predicted vs Actual Delay Days (Dual-Axis Line Chart)            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Visuals

| # | Visual | Chart Type | Data Source | Fields |
|---|---|---|---|---|
| 1 | Delay Rate Over Time | Area Chart | `monthly_delay_trend.sql` | X: `trend_month`, Y: `delay_rate_pct`, with Power BI forecast line (next 3 months) |
| 2 | Delayed vs Total Invoices | Clustered Bar | `monthly_delay_trend.sql` | X: `trend_month`, Y₁: `total_invoices`, Y₂: `delayed_invoices` |
| 3 | At-Risk Amount Trend | Line Chart | `monthly_delay_trend.sql` | X: `trend_month`, Y: `overdue_open_amount` |
| 4 | Predicted vs Actual Delay | Dual-Axis Line | `monthly_delay_trend.sql` | X: `trend_month`, Y₁: `weighted_avg_delay_days` (actual), Y₂: `weighted_avg_predicted_delay_days` (predicted) |

---

## 5. Page 3 — Delay Analysis

### Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  [Slicer: Category]  [Slicer: Currency]  [Slicer: Status]        │
├────────────────────────────────┬───────────────────────────────────┤
│                                │                                   │
│   Aging Buckets                │   Probability Distribution        │
│   (Stacked Bar Chart)         │   (Histogram / Column Chart)      │
│                                │                                   │
├────────────────────────────────┼───────────────────────────────────┤
│                                │                                   │
│   Predicted Delay Days         │   Delay by Category × Region      │
│   Distribution                 │   (Matrix / Heatmap)              │
│   (Column Chart)               │                                   │
│                                │                                   │
├────────────────────────────────┴───────────────────────────────────┤
│                                                                    │
│   Open Invoices Aging Detail (Table — drill-through target)        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Visuals

| # | Visual | Chart Type | Data Source | Fields |
|---|---|---|---|---|
| 1 | Aging Buckets | Stacked Bar | `aging_buckets.sql` | X: `aging_bucket` (sorted by `aging_bucket_sort_order`), Y: `total_outstanding`, colour segment: `region` from view |
| 2 | Probability Distribution | Column Chart | `predicted_delay_distribution.sql` (query 1) | X: `probability_bucket` (sorted by `bucket_sort`), Y: `invoice_count`, data labels: `total_amount` |
| 3 | Predicted Delay Days | Column Chart | `predicted_delay_distribution.sql` (query 2) | X: `delay_days_bucket` (sorted by `bucket_sort`), Y: `invoice_count` |
| 4 | Category × Region Heatmap | Matrix | `delay_overview` view | Rows: `category`, Columns: `region`, Values: `AVG(delay_days)`, conditional formatting (colour scale green → red) |
| 5 | Aging Detail Table | Table | `aging_buckets` view | Columns: `invoice_number`, `customer_name`, `due_date`, `days_past_due`, `outstanding_amount`, `aging_bucket` — used as drill-through target from the bar chart |

---

## 6. Page 4 — Customer Risk

### Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  [Slicer: Risk Tier]  [Slicer: Industry]  [Slicer: Region]       │
├──────────────────┬─────────────────────────────────────────────────┤
│                  │                                                 │
│  Risk Tier       │  Top 20 Customers by Composite Risk (Table)     │
│  Breakdown       │                                                 │
│  (Pie Chart)     │                                                 │
│                  │                                                 │
├──────────────────┴─────────────────────────────────────────────────┤
│                                                                    │
│   Customer Risk Score vs Open Exposure (Scatter Plot)              │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   High-Risk Customer Detail (Table — drill-through target)         │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Visuals

| # | Visual | Chart Type | Data Source | Fields |
|---|---|---|---|---|
| 1 | Risk Tier Breakdown | Pie Chart | `customer_risk` view | Legend: `risk_tier`, Values: count of `customer_id` |
| 2 | Top 20 by Risk | Table | `top_customers_by_risk.sql` | Columns: `composite_risk_rank`, `customer_name`, `risk_tier`, `risk_score`, `open_invoice_amount`, `credit_utilisation_pct`, `historical_delay_rate_pct`, `avg_predicted_delay_days` — conditional formatting on `risk_score` |
| 3 | Risk vs Exposure | Scatter Plot | `customer_risk` view | X: `open_invoice_amount`, Y: `risk_score`, Size: `total_invoices`, Colour: `risk_tier`, Tooltip: `customer_name` |
| 4 | High-Risk Detail | Table | `high_risk_customers.sql` | Drill-through from pie chart or scatter; shows full customer invoice profile and prediction stats |

---

## 7. Page 5 — Prediction Performance

### Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  [KPI Card]      [KPI Card]      [KPI Card]      [KPI Card]      │
│  Accuracy        F1-Score        Live MAE        Resolved         │
│  (TP+TN)/Total   Training        Delay Days      Predictions      │
├────────────────────────────────┬───────────────────────────────────┤
│                                │                                   │
│   Confusion Matrix             │   Predicted vs Actual Delay       │
│   (Matrix / custom visual)     │   (Scatter Plot)                  │
│                                │                                   │
├────────────────────────────────┼───────────────────────────────────┤
│                                │                                   │
│   Model Metrics Comparison     │   F1-Score Over Time              │
│   (Grouped Bar Chart)          │   (Line Chart)                    │
│                                │                                   │
└────────────────────────────────┴───────────────────────────────────┘
```

### Visuals

| # | Visual | Chart Type | Data Source | Fields |
|---|---|---|---|---|
| 1 | Accuracy | KPI Card | `model_performance` view | Calculated: `(true_positives + true_negatives) / resolved_predictions` — filter `is_active = TRUE` |
| 2 | F1-Score | KPI Card | `model_performance` view | `training_f1_score` — filter `is_active = TRUE` |
| 3 | Live MAE | KPI Card | `model_performance` view | `live_mae_delay_days` — filter `is_active = TRUE` |
| 4 | Resolved Predictions | KPI Card | `model_performance` view | `resolved_predictions` — filter `is_active = TRUE` |
| 5 | Confusion Matrix | Matrix | `model_performance` view | Values: `true_positives`, `false_positives`, `true_negatives`, `false_negatives`, conditional formatting (colour intensity) |
| 6 | Predicted vs Actual Delay | Scatter Plot | `delay_overview` view | X: `predicted_delay_days`, Y: `delay_days`, filtered to `actual_payment_date IS NOT NULL`, add 45° reference line |
| 7 | Model Metrics Comparison | Grouped Bar | `model_performance` view | Category: `model_name + model_version`, Values: `training_f1_score`, `training_precision`, `training_recall`, `training_auc_roc` |
| 8 | F1-Score Over Time | Line Chart | `model_performance` view | X: `deployed_at`, Y: `training_f1_score`, one line per `model_name` |

---

## 8. KPI Definitions

| KPI | Definition | Formula | Target |
|---|---|---|---|
| **Total Invoices** | Count of all invoices in the system | `COUNT(*)` from `delay_overview` | — |
| **Delay Rate %** | Percentage of paid invoices that were late | `delayed_invoices / paid_invoices × 100` | < 15% |
| **Avg Delay Days** | Mean days late for delayed invoices | `AVG(delay_days) WHERE actually_delayed` | < 7 days |
| **At-Risk Amount** | Total value of invoices predicted to be delayed | `SUM(amount) WHERE predicted_will_be_delayed` | Minimise |
| **Outstanding Amount** | Total unpaid invoice balance | `SUM(outstanding_amount)` | — |
| **Prediction Coverage %** | % of invoices with an ML prediction | `invoices_with_predictions / total_invoices × 100` | > 95% |
| **Credit Utilisation %** | Customer's open invoices as % of credit limit | `open_invoice_amount / credit_limit × 100` | < 80% |
| **Historical Delay Rate** | Customer's lifetime % of late payments | `delayed_invoice_count / paid_invoice_count × 100` | < 20% |
| **Model Accuracy** | Correct predictions / total resolved | `(TP + TN) / resolved_predictions` | > 85% |
| **F1-Score** | Harmonic mean of precision & recall (delay class) | From `training_f1_score` in `model_performance` | > 0.80 |
| **Live MAE** | Mean absolute error on predicted delay days | `AVG(ABS(predicted_days - actual_days))` | < 5 days |
| **Composite Risk Rank** | Blended customer riskiness score | `risk_score×0.4 + credit_util×0.3 + late_ratio×0.3` | — |

---

## 9. Filters & Slicers

### Global Filters (visible on all pages)

| Slicer | Type | Source | Notes |
|---|---|---|---|
| **Date Range** | Date range picker | `delay_overview.issue_date` | Filters all visuals; default = last 12 months |
| **Currency** | Dropdown | `delay_overview.currency` | Multi-select |

### Page-Specific Slicers

| Page | Slicer | Type | Source |
|---|---|---|---|
| Executive Summary | *(global only)* | — | — |
| Trend & Forecast | Region | Dropdown (multi) | `trend_analysis.region` |
| Trend & Forecast | Industry | Dropdown (multi) | `trend_analysis.industry` |
| Delay Analysis | Category | Dropdown (multi) | `delay_overview.category` |
| Delay Analysis | Invoice Status | Dropdown (multi) | `delay_overview.status` |
| Customer Risk | Risk Tier | Button / chip | `customer_risk.risk_tier` |
| Customer Risk | Industry | Dropdown (multi) | `customer_risk.industry` |
| Customer Risk | Region | Dropdown (multi) | `customer_risk.region` |
| Prediction Performance | Model Name | Dropdown | `model_performance.model_name` |
| Prediction Performance | Is Active | Toggle | `model_performance.is_active` |

### Cross-Filtering Behaviour

- Clicking a **risk tier segment** in the pie chart filters the top-20 table and scatter plot
- Clicking an **aging bucket bar** drills through to the detail table showing individual invoices
- Clicking a **customer row** in any table drills through to the Customer Risk detail page
- Clicking a **month** on a trend chart cross-filters all other visuals on the same page

---

## 10. Theme & Formatting

### Colour Palette

| Semantic Use | Colour | Hex |
|---|---|---|
| Primary (brand) | Deep indigo | `#4C51BF` |
| On-time / healthy | Emerald | `#10B981` |
| Warning / medium risk | Amber | `#F59E0B` |
| Delayed / high risk | Coral red | `#EF4444` |
| Critical | Deep red | `#991B1B` |
| Neutral / background | Slate grey | `#64748B` |
| Card background | Off-white | `#F8FAFC` |

### Risk Tier Colour Map (conditional formatting)

| Tier | Background | Text |
|---|---|---|
| LOW | `#D1FAE5` | `#065F46` |
| MEDIUM | `#FEF3C7` | `#92400E` |
| HIGH | `#FEE2E2` | `#991B1B` |
| CRITICAL | `#991B1B` | `#FFFFFF` |

### Typography

- **Headings**: Segoe UI Semibold, 14pt
- **Card values**: Segoe UI Bold, 28pt
- **Body / tables**: Segoe UI, 10pt
- **Slicer labels**: Segoe UI, 9pt

### Formatting Rules

- All currency values formatted with thousand separators and 2 decimal places
- Percentages displayed to 1 decimal place with `%` suffix
- Dates formatted as `MMM YYYY` on trend axes, `DD MMM YYYY` in tables
- Tables capped at 100 rows with "See all" drill-through link
- Conditional formatting (data bars or colour scale) on `risk_score`, `delay_days`, `outstanding_amount`

---

## 11. Data Connection Setup

### Option A — DirectQuery (recommended for real-time)

1. Open Power BI Desktop → **Get Data → PostgreSQL Database**
2. Enter server host, port `5432`, database name `invoice_delay`
3. Select **DirectQuery** mode
4. Import the five views: `delay_overview`, `customer_risk`, `trend_analysis`, `aging_buckets`, `model_performance`
5. For each custom query file, use **Advanced → SQL Statement** and paste the SQL from `dashboard/sql/*.sql`

### Option B — Scheduled Import (recommended for large datasets)

1. Same connection steps, but choose **Import** mode
2. Set refresh schedule: every 4 hours during business hours
3. Use **Incremental Refresh** on `delay_overview` partitioned by `issue_date`

### Relationships in Power BI Model

```
delay_overview.customer_id  →  customer_risk.customer_id   (many-to-one)
delay_overview.invoice_id   →  aging_buckets.invoice_id    (one-to-one, filtered)
```

> **Note:** Most queries are self-contained and don't require cross-table relationships. The views already join the necessary tables internally.

---

## 12. Deployment Checklist

- [ ] Connect Power BI to PostgreSQL and import all 5 views
- [ ] Create 6 custom datasets from `dashboard/sql/*.sql`
- [ ] Build each page following the layouts above
- [ ] Apply the colour palette and conditional formatting rules
- [ ] Configure slicers and cross-filtering
- [ ] Set up drill-through from aging buckets → detail table
- [ ] Set up drill-through from customer pie chart → detail table
- [ ] Add 45° reference line to Predicted vs Actual scatter plot
- [ ] Enable Power BI forecast on the Delay Rate trend line (3 months)
- [ ] Test with sample data — verify all KPI cards show correct values
- [ ] Publish to Power BI Service workspace
- [ ] Configure scheduled refresh (if using Import mode)
- [ ] Share dashboard with stakeholders and set row-level security if needed
