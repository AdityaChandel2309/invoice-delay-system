"""Tests for the ML feature engineering pipeline."""

from datetime import date, datetime
from decimal import Decimal

import pandas as pd
import pytest

from app.ml.feature_engineering import FEATURE_COLUMNS, build_features


class FakeCustomer:
    """Minimal object mimicking the Customer ORM model."""

    def __init__(self, **kwargs):
        self.avg_payment_days = kwargs.get("avg_payment_days", Decimal("35.0"))
        self.late_payment_ratio = kwargs.get("late_payment_ratio", Decimal("0.2"))
        self.credit_limit = kwargs.get("credit_limit", Decimal("100000"))
        self.created_at = kwargs.get("created_at", datetime(2024, 1, 1))


class FakeInvoice:
    """Minimal object mimicking the Invoice ORM model."""

    def __init__(self, **kwargs):
        self.amount = kwargs.get("amount", Decimal("50000"))
        self.issue_date = kwargs.get("issue_date", date(2026, 3, 15))
        self.due_date = kwargs.get("due_date", date(2026, 4, 14))
        self.is_recurring = kwargs.get("is_recurring", False)


class TestBuildFeatures:
    def test_returns_dataframe(self):
        inv = FakeInvoice()
        cust = FakeCustomer()
        df = build_features(inv, cust, reference_date=date(2026, 3, 15))
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 1

    def test_column_order(self):
        inv = FakeInvoice()
        cust = FakeCustomer()
        df = build_features(inv, cust, reference_date=date(2026, 3, 15))
        assert list(df.columns) == FEATURE_COLUMNS

    def test_feature_values(self):
        inv = FakeInvoice()
        cust = FakeCustomer()
        ref = date(2026, 3, 15)
        df = build_features(inv, cust, reference_date=ref)
        row = df.iloc[0]

        assert row["invoice_amount"] == 50000.0
        assert row["days_until_due"] == 30  # Apr 14 - Mar 15
        assert row["invoice_age"] == 0      # same day as issue
        assert row["payment_term_net_days"] == 30
        assert row["is_recurring"] == 0
        assert row["avg_payment_days"] == 35.0
        assert row["late_payment_ratio"] == 0.2
        assert row["credit_limit"] == 100000.0
        assert row["amount_to_credit_ratio"] == 0.5
        assert row["month_issued"] == 3
        assert row["quarter_issued"] == 1

    def test_overrides(self):
        inv = FakeInvoice()
        cust = FakeCustomer()
        df = build_features(
            inv, cust,
            reference_date=date(2026, 3, 15),
            overrides={"invoice_amount": 999},
        )
        assert df.iloc[0]["invoice_amount"] == 999

    def test_recurring_flag(self):
        inv = FakeInvoice(is_recurring=True)
        cust = FakeCustomer()
        df = build_features(inv, cust, reference_date=date(2026, 3, 15))
        assert df.iloc[0]["is_recurring"] == 1

    def test_month_end_detection(self):
        inv = FakeInvoice(issue_date=date(2026, 3, 31))
        cust = FakeCustomer()
        df = build_features(inv, cust, reference_date=date(2026, 3, 31))
        assert df.iloc[0]["is_month_end"] == 1

    def test_quarter_end_detection(self):
        inv = FakeInvoice(issue_date=date(2026, 3, 29))
        cust = FakeCustomer()
        df = build_features(inv, cust, reference_date=date(2026, 3, 29))
        assert df.iloc[0]["is_quarter_end"] == 1

    def test_zero_credit_limit(self):
        inv = FakeInvoice()
        cust = FakeCustomer(credit_limit=Decimal("0"))
        df = build_features(inv, cust, reference_date=date(2026, 3, 15))
        assert df.iloc[0]["amount_to_credit_ratio"] == 0.0
