"""Analytics endpoints — aggregate data for dashboard / Power BI.

These endpoints query the pre-created SQL views (003_create_views.sql)
so the heavy lifting is done by the database.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..database import get_db

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────

def _rows_to_dicts(result) -> list[dict]:
    """Convert SQLAlchemy result rows to a list of dicts."""
    return [dict(row._mapping) for row in result]


def _row_to_dict(result) -> dict | None:
    """Convert a single result row to a dict."""
    row = result.first()
    return dict(row._mapping) if row else None


# ── Delay Overview ────────────────────────────────────────────────────

@router.get(
    "/delay-overview",
    summary="Aggregate delay statistics",
    description="KPI-level summary: totals, rates, amounts, prediction coverage.",
)
def delay_overview(db: Session = Depends(get_db)) -> dict:
    result = db.execute(text("""
        SELECT
            COUNT(*)                                                    AS total_invoices,
            COUNT(*) FILTER (WHERE status = 'paid')                    AS paid_invoices,
            COUNT(*) FILTER (WHERE status = 'overdue')                 AS overdue_invoices,
            COUNT(*) FILTER (WHERE status IN ('issued','overdue'))      AS open_invoices,
            ROUND(
                100.0 * COUNT(*) FILTER (WHERE actual_payment_date > due_date)
                / NULLIF(COUNT(*) FILTER (WHERE status = 'paid'), 0), 1
            )                                                           AS delay_rate_pct,
            ROUND(AVG(
                CASE WHEN actual_payment_date > due_date
                     THEN (actual_payment_date - due_date)
                END
            ), 1)                                                       AS avg_delay_days,
            MAX(
                CASE WHEN actual_payment_date > due_date
                     THEN (actual_payment_date - due_date)
                END
            )                                                           AS max_delay_days,
            ROUND(SUM(amount), 0)                                       AS total_invoiced_amount,
            ROUND(SUM(CASE WHEN status IN ('issued','overdue')
                       THEN amount ELSE 0 END), 0)                      AS total_outstanding_amount,
            ROUND(SUM(CASE WHEN p.delay_probability >= 0.5
                       THEN i.amount ELSE 0 END), 0)                    AS total_at_risk_amount,
            ROUND(
                100.0 * COUNT(p.id) / NULLIF(COUNT(i.id), 0), 1
            )                                                           AS prediction_coverage_pct,
            ROUND(AVG(p.delay_probability), 3)                          AS avg_delay_probability
        FROM invoices i
        LEFT JOIN predictions p ON p.invoice_id = i.id
    """))
    row = _row_to_dict(result)
    return row or {}


# ── Monthly Delay Trend ───────────────────────────────────────────────

@router.get(
    "/delay-trend",
    summary="Monthly delay trend",
    description="Monthly aggregated delay statistics over time.",
)
def delay_trend(
    months: int = Query(12, ge=1, le=36, description="Number of months to return"),
    db: Session = Depends(get_db),
) -> list[dict]:
    result = db.execute(text("""
        SELECT
            TO_CHAR(issue_date, 'YYYY-MM')                              AS month,
            COUNT(*)                                                    AS total_invoices,
            COUNT(*) FILTER (WHERE actual_payment_date > due_date)      AS delayed_invoices,
            ROUND(
                100.0 * COUNT(*) FILTER (WHERE actual_payment_date > due_date)
                / NULLIF(COUNT(*), 0), 1
            )                                                           AS delay_rate_pct,
            ROUND(SUM(amount), 0)                                       AS invoiced_amount,
            ROUND(SUM(
                CASE WHEN actual_payment_date > due_date THEN amount ELSE 0 END
            ), 0)                                                       AS delayed_amount,
            ROUND(AVG(
                CASE WHEN actual_payment_date > due_date
                     THEN (actual_payment_date - due_date) END
            ), 1)                                                       AS avg_delay_days
        FROM invoices
        WHERE status = 'paid'
        GROUP BY TO_CHAR(issue_date, 'YYYY-MM')
        ORDER BY month DESC
        LIMIT :months
    """), {"months": months})
    return _rows_to_dicts(result)


# ── Customer Risk Distribution ────────────────────────────────────────

@router.get(
    "/customer-risk",
    summary="Customer risk distribution",
    description="All customers with their risk scores, tiers, and invoice summaries.",
)
def customer_risk(
    tier: str | None = Query(None, description="Filter by risk tier"),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[dict]:
    sql = """
        SELECT
            c.id                                         AS customer_id,
            c.name                                       AS customer_name,
            c.industry,
            c.region,
            c.size_category,
            c.credit_limit,
            crs.risk_score,
            crs.risk_tier,
            COUNT(i.id)                                  AS total_invoices,
            COUNT(i.id) FILTER (WHERE i.status = 'overdue')    AS overdue_count,
            COUNT(i.id) FILTER (WHERE i.actual_payment_date > i.due_date) AS delayed_count,
            ROUND(SUM(CASE WHEN i.status IN ('issued','overdue')
                       THEN i.amount ELSE 0 END), 0)    AS open_amount,
            ROUND(AVG(p.delay_probability), 3)           AS avg_delay_probability
        FROM customers c
        LEFT JOIN customer_risk_scores crs ON crs.customer_id = c.id
        LEFT JOIN invoices i ON i.customer_id = c.id
        LEFT JOIN predictions p ON p.invoice_id = i.id
    """
    params: dict = {"lim": limit}
    if tier:
        sql += " WHERE crs.risk_tier = :tier"
        params["tier"] = tier
    sql += """
        GROUP BY c.id, c.name, c.industry, c.region, c.size_category, c.credit_limit,
                 crs.risk_score, crs.risk_tier
        ORDER BY crs.risk_score DESC NULLS LAST
        LIMIT :lim
    """
    result = db.execute(text(sql), params)
    return _rows_to_dicts(result)


# ── Model Performance ────────────────────────────────────────────────

@router.get(
    "/model-performance",
    summary="Live model accuracy metrics",
    description="Compare predicted vs actual outcomes for active models.",
)
def model_performance(db: Session = Depends(get_db)) -> list[dict]:
    result = db.execute(text("""
        SELECT
            m.id                                                AS model_id,
            m.model_name,
            m.model_version,
            m.model_type,
            m.is_active,
            m.metrics,
            COUNT(p.id)                                         AS total_predictions,
            COUNT(p.id) FILTER (
                WHERE p.will_be_delayed = TRUE
            )                                                    AS predicted_delayed,
            COUNT(p.id) FILTER (
                WHERE p.will_be_delayed = FALSE
            )                                                    AS predicted_on_time,
            ROUND(AVG(p.delay_probability), 4)                   AS avg_probability,
            ROUND(AVG(p.predicted_delay_days), 1)                AS avg_predicted_days
        FROM ml_model_registry m
        LEFT JOIN predictions p ON p.model_id = m.id
        GROUP BY m.id, m.model_name, m.model_version, m.model_type,
                 m.is_active, m.metrics
        ORDER BY m.is_active DESC, m.deployed_at DESC NULLS LAST
    """))
    return _rows_to_dicts(result)


# ── Aging Buckets ─────────────────────────────────────────────────────

@router.get(
    "/aging-buckets",
    summary="Accounts receivable aging analysis",
    description="Open invoices grouped by days past due.",
)
def aging_buckets(db: Session = Depends(get_db)) -> list[dict]:
    result = db.execute(text("""
        WITH open_inv AS (
            SELECT
                id,
                amount,
                due_date,
                GREATEST(CURRENT_DATE - due_date, 0) AS days_past_due
            FROM invoices
            WHERE status IN ('issued', 'overdue')
        ),
        bucketed AS (
            SELECT
                CASE
                    WHEN days_past_due = 0  THEN 'Current'
                    WHEN days_past_due <= 30 THEN '1-30 Days'
                    WHEN days_past_due <= 60 THEN '31-60 Days'
                    WHEN days_past_due <= 90 THEN '61-90 Days'
                    ELSE '90+ Days'
                END AS bucket,
                CASE
                    WHEN days_past_due = 0  THEN 0
                    WHEN days_past_due <= 30 THEN 1
                    WHEN days_past_due <= 60 THEN 2
                    WHEN days_past_due <= 90 THEN 3
                    ELSE 4
                END AS sort_order,
                amount,
                days_past_due
            FROM open_inv
        )
        SELECT
            bucket,
            sort_order,
            COUNT(*)                            AS invoice_count,
            ROUND(SUM(amount), 0)               AS total_outstanding,
            ROUND(AVG(days_past_due), 1)        AS avg_days_past_due
        FROM bucketed
        GROUP BY bucket, sort_order
        ORDER BY sort_order
    """))
    return _rows_to_dicts(result)
