"""Build a feature vector from invoice + customer ORM objects.

The output is a single-row ``pandas.DataFrame`` whose column order and
names exactly match the features the trained models expect.  When adding
new features here, make sure the training notebooks are updated in sync.
"""

from __future__ import annotations

import calendar
from datetime import date, datetime
from decimal import Decimal
from typing import Any

import pandas as pd

from ..models.customer import Customer
from ..models.invoice import Invoice

# ── Canonical feature order (must match training) ─────────────────────
FEATURE_COLUMNS: list[str] = [
    "invoice_amount",
    "days_until_due",
    "invoice_age",
    "payment_term_net_days",
    "is_recurring",
    "avg_payment_days",
    "late_payment_ratio",
    "credit_limit",
    "customer_tenure_days",
    "amount_to_credit_ratio",
    "month_issued",
    "day_of_week_issued",
    "quarter_issued",
    "is_month_end",
    "is_quarter_end",
]


def _safe_float(value: Decimal | float | None, default: float = 0.0) -> float:
    """Convert a Decimal / None to a plain float."""
    if value is None:
        return default
    return float(value)


def _today() -> date:
    """Mockable "today" for testing."""
    return date.today()


def build_features(
    invoice: Invoice,
    customer: Customer,
    *,
    reference_date: date | None = None,
    overrides: dict[str, Any] | None = None,
) -> pd.DataFrame:
    """Return a single-row DataFrame of model-ready features.

    Parameters
    ----------
    invoice:
        The invoice ORM instance.
    customer:
        The associated customer ORM instance.
    reference_date:
        The date to compute relative features against.  Defaults to
        today so that predictions made at different times give
        time-appropriate values.
    overrides:
        Optional dict of ``{feature_name: value}`` that will replace
        computed values (useful for what-if analysis via the API).
    """
    today = reference_date or _today()
    issue: date = invoice.issue_date
    due: date = invoice.due_date

    # ── Invoice-level features ────────────────────────────────────────
    invoice_amount = _safe_float(invoice.amount)
    days_until_due = (due - today).days
    invoice_age = (today - issue).days
    payment_term_net_days = (due - issue).days
    is_recurring = int(invoice.is_recurring)

    # ── Customer-level features ───────────────────────────────────────
    avg_payment_days = _safe_float(customer.avg_payment_days, default=30.0)
    late_payment_ratio = _safe_float(customer.late_payment_ratio)
    credit_limit = _safe_float(customer.credit_limit, default=1.0)
    customer_tenure_days = (today - customer.created_at.date()).days if customer.created_at else 0

    # ── Derived / interaction features ────────────────────────────────
    amount_to_credit_ratio = (
        invoice_amount / credit_limit if credit_limit > 0 else 0.0
    )

    # ── Calendar features ─────────────────────────────────────────────
    month_issued = issue.month
    day_of_week_issued = issue.weekday()  # 0=Mon … 6=Sun
    quarter_issued = (issue.month - 1) // 3 + 1

    last_day = calendar.monthrange(issue.year, issue.month)[1]
    is_month_end = int(issue.day >= last_day - 2)  # last 3 days of month

    is_quarter_end = int(
        issue.month in {3, 6, 9, 12} and issue.day >= last_day - 4
    )

    # ── Assemble row ──────────────────────────────────────────────────
    row: dict[str, Any] = {
        "invoice_amount": invoice_amount,
        "days_until_due": days_until_due,
        "invoice_age": invoice_age,
        "payment_term_net_days": payment_term_net_days,
        "is_recurring": is_recurring,
        "avg_payment_days": avg_payment_days,
        "late_payment_ratio": late_payment_ratio,
        "credit_limit": credit_limit,
        "customer_tenure_days": customer_tenure_days,
        "amount_to_credit_ratio": amount_to_credit_ratio,
        "month_issued": month_issued,
        "day_of_week_issued": day_of_week_issued,
        "quarter_issued": quarter_issued,
        "is_month_end": is_month_end,
        "is_quarter_end": is_quarter_end,
    }

    # Apply caller-supplied overrides (what-if analysis)
    if overrides:
        for key, value in overrides.items():
            if key in row:
                row[key] = value

    # Return in canonical column order
    return pd.DataFrame([row], columns=FEATURE_COLUMNS)


def build_features_batch(
    pairs: list[tuple[Invoice, Customer]],
    *,
    reference_date: date | None = None,
) -> pd.DataFrame:
    """Vectorised version for batch predictions.

    Parameters
    ----------
    pairs:
        List of ``(invoice, customer)`` tuples.
    reference_date:
        Shared reference date for all rows.

    Returns
    -------
    pd.DataFrame
        A DataFrame with one row per invoice, columns in
        ``FEATURE_COLUMNS`` order.
    """
    frames = [
        build_features(inv, cust, reference_date=reference_date)
        for inv, cust in pairs
    ]
    return pd.concat(frames, ignore_index=True)
