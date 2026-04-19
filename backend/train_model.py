"""Train XGBoost classifier + regressor from sample CSV data.

Loads:
    data/sample/customers.csv
    data/sample/invoices.csv

Saves:
    ml_models/classifier/model.joblib   (binary: delayed vs on-time)
    ml_models/regressor/model.joblib    (continuous: predicted delay days)

Run from the project root:
    python backend/train_model.py

The feature engineering logic here mirrors
backend/app/ml/feature_engineering.py exactly so that training features
and production inference features stay in sync.
"""

from __future__ import annotations

import calendar
import logging
import sys
from datetime import date, datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier, XGBRegressor

# ── Paths ─────────────────────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "sample"
MODELS_DIR = PROJECT_ROOT / "ml_models"

CUSTOMERS_CSV = DATA_DIR / "customers.csv"
INVOICES_CSV = DATA_DIR / "invoices.csv"

CLASSIFIER_DIR = MODELS_DIR / "classifier"
REGRESSOR_DIR = MODELS_DIR / "regressor"

# ── Logging ───────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)-7s │ %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("train")

# ── Canonical feature columns (must match feature_engineering.py) ─────

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


# ── 1. Load data ──────────────────────────────────────────────────────


def load_data() -> tuple[pd.DataFrame, pd.DataFrame]:
    """Read customers and invoices CSVs."""
    log.info("Loading data from %s", DATA_DIR)

    customers = pd.read_csv(CUSTOMERS_CSV, parse_dates=["created_at", "updated_at"])
    invoices = pd.read_csv(
        INVOICES_CSV,
        parse_dates=["issue_date", "due_date", "actual_payment_date"],
    )

    log.info("  Customers : %d rows", len(customers))
    log.info("  Invoices  : %d rows", len(invoices))
    return customers, invoices


# ── 2. Build features ────────────────────────────────────────────────


def build_training_features(
    invoices: pd.DataFrame,
    customers: pd.DataFrame,
) -> pd.DataFrame:
    """Engineer features + labels for every paid invoice.

    Only invoices with status == 'paid' (i.e. with a known
    actual_payment_date) can be used for supervised learning.

    The feature logic replicates backend/app/ml/feature_engineering.py
    but operates on DataFrames instead of ORM objects.
    """
    log.info("Building features …")

    # Keep only paid invoices (we need actual_payment_date for labels)
    paid = invoices[invoices["status"] == "paid"].copy()
    log.info("  Paid invoices: %d", len(paid))

    # Merge customer attributes
    df = paid.merge(
        customers[["id", "avg_payment_days", "late_payment_ratio",
                    "credit_limit", "created_at"]],
        left_on="customer_id",
        right_on="id",
        how="left",
        suffixes=("", "_cust"),
    )

    # ── Labels ────────────────────────────────────────────────────────
    df["delay_days"] = (df["actual_payment_date"] - df["due_date"]).dt.days
    df["is_delayed"] = (df["delay_days"] > 0).astype(int)
    # For the regressor we only care about positive delay; on-time = 0
    df["delay_days_clamped"] = df["delay_days"].clip(lower=0)

    # ── Reference date = issue_date (mimics prediction at invoice creation)
    issue = df["issue_date"]
    due = df["due_date"]
    cust_created = df["created_at_cust"] if "created_at_cust" in df.columns else df["created_at"]

    df["invoice_amount"] = df["amount"].astype(float)
    df["days_until_due"] = (due - issue).dt.days   # at issue time, full term
    df["invoice_age"] = 0                          # at issue time, age = 0
    df["payment_term_net_days"] = (due - issue).dt.days
    df["is_recurring"] = df["is_recurring"].astype(int)

    # Customer features
    df["avg_payment_days"] = df["avg_payment_days"].fillna(30.0).astype(float)
    df["late_payment_ratio"] = df["late_payment_ratio"].fillna(0.0).astype(float)
    df["credit_limit"] = df["credit_limit"].fillna(1.0).astype(float)
    df["customer_tenure_days"] = (issue - cust_created).dt.days.clip(lower=0)

    # Derived
    df["amount_to_credit_ratio"] = np.where(
        df["credit_limit"] > 0,
        df["invoice_amount"] / df["credit_limit"],
        0.0,
    )

    # Calendar features (from issue_date)
    df["month_issued"] = issue.dt.month
    df["day_of_week_issued"] = issue.dt.dayofweek  # 0=Mon … 6=Sun
    df["quarter_issued"] = issue.dt.quarter

    # is_month_end: last 3 days of the month
    last_day_of_month = issue.apply(
        lambda d: calendar.monthrange(d.year, d.month)[1]
    )
    df["is_month_end"] = (issue.dt.day >= last_day_of_month - 2).astype(int)

    # is_quarter_end: month in {3,6,9,12} AND last 5 days
    df["is_quarter_end"] = (
        issue.dt.month.isin([3, 6, 9, 12])
        & (issue.dt.day >= last_day_of_month - 4)
    ).astype(int)

    log.info("  Delayed   : %d  (%.1f%%)",
             df["is_delayed"].sum(),
             df["is_delayed"].mean() * 100)
    log.info("  On-time   : %d  (%.1f%%)",
             (1 - df["is_delayed"]).sum(),
             (1 - df["is_delayed"]).mean() * 100)
    log.info("  Avg delay (delayed only): %.1f days",
             df.loc[df["is_delayed"] == 1, "delay_days_clamped"].mean())

    return df


# ── 3. Train models ──────────────────────────────────────────────────


def train(df: pd.DataFrame) -> tuple:
    """Train classifier + regressor and print evaluation metrics."""

    X = df[FEATURE_COLUMNS].copy()
    y_cls = df["is_delayed"].values
    y_reg = df["delay_days_clamped"].values

    X_train, X_test, y_cls_train, y_cls_test, y_reg_train, y_reg_test = (
        train_test_split(X, y_cls, y_reg, test_size=0.2, random_state=42,
                         stratify=y_cls)
    )

    log.info("Split: train=%d  test=%d", len(X_train), len(X_test))

    # ── Classifier ────────────────────────────────────────────────────
    log.info("Training XGBoost classifier …")

    # Handle class imbalance with scale_pos_weight
    n_neg = (y_cls_train == 0).sum()
    n_pos = (y_cls_train == 1).sum()
    scale_pos_weight = n_neg / max(n_pos, 1)

    clf = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(
        X_train, y_cls_train,
        eval_set=[(X_test, y_cls_test)],
        verbose=False,
    )

    y_cls_pred = clf.predict(X_test)
    y_cls_proba = clf.predict_proba(X_test)[:, 1]

    log.info("── Classifier metrics ─────────────────────────")
    log.info("  Accuracy : %.4f", accuracy_score(y_cls_test, y_cls_pred))
    log.info("  F1       : %.4f", f1_score(y_cls_test, y_cls_pred))
    log.info("  ROC-AUC  : %.4f", roc_auc_score(y_cls_test, y_cls_proba))
    log.info("\n%s", classification_report(y_cls_test, y_cls_pred,
                                           target_names=["On-time", "Delayed"]))

    # ── Regressor (trained only on delayed invoices) ──────────────────
    log.info("Training XGBoost regressor …")

    # Train on all data but the target for on-time invoices is 0
    reg = XGBRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="rmse",
        random_state=42,
        n_jobs=-1,
    )
    reg.fit(
        X_train, y_reg_train,
        eval_set=[(X_test, y_reg_test)],
        verbose=False,
    )

    y_reg_pred = reg.predict(X_test)
    y_reg_pred_clipped = np.clip(np.round(y_reg_pred), 0, None).astype(int)

    log.info("── Regressor metrics (all invoices) ───────────")
    log.info("  MAE  : %.2f days", mean_absolute_error(y_reg_test, y_reg_pred_clipped))
    log.info("  RMSE : %.2f days", np.sqrt(mean_squared_error(y_reg_test, y_reg_pred_clipped)))
    log.info("  R²   : %.4f", r2_score(y_reg_test, y_reg_pred_clipped))

    # Metrics only for delayed invoices
    delayed_mask = y_cls_test == 1
    if delayed_mask.sum() > 0:
        log.info("── Regressor metrics (delayed only) ──────────")
        log.info("  MAE  : %.2f days",
                 mean_absolute_error(y_reg_test[delayed_mask],
                                     y_reg_pred_clipped[delayed_mask]))
        log.info("  RMSE : %.2f days",
                 np.sqrt(mean_squared_error(y_reg_test[delayed_mask],
                                            y_reg_pred_clipped[delayed_mask])))

    # ── Feature importance ────────────────────────────────────────────
    log.info("── Top feature importances (classifier) ──────")
    importances = clf.feature_importances_
    indices = np.argsort(importances)[::-1]
    for rank, idx in enumerate(indices[:10], 1):
        log.info("  %2d. %-28s  %.4f", rank, FEATURE_COLUMNS[idx], importances[idx])

    return clf, reg


# ── 4. Save models ───────────────────────────────────────────────────


def save_models(clf, reg) -> None:
    """Persist models to disk as joblib files."""
    CLASSIFIER_DIR.mkdir(parents=True, exist_ok=True)
    REGRESSOR_DIR.mkdir(parents=True, exist_ok=True)

    clf_path = CLASSIFIER_DIR / "model.joblib"
    reg_path = REGRESSOR_DIR / "model.joblib"

    joblib.dump(clf, clf_path)
    joblib.dump(reg, reg_path)

    log.info("Saved classifier  → %s  (%.1f KB)",
             clf_path, clf_path.stat().st_size / 1024)
    log.info("Saved regressor   → %s  (%.1f KB)",
             reg_path, reg_path.stat().st_size / 1024)


# ── Main ──────────────────────────────────────────────────────────────


def main() -> None:
    log.info("=" * 60)
    log.info("Invoice Payment Delay — Model Training")
    log.info("=" * 60)

    # Validate data exists
    for path in (CUSTOMERS_CSV, INVOICES_CSV):
        if not path.exists():
            log.error("Missing data file: %s", path)
            log.error("Run 'python data/generate_sample_data.py' first.")
            sys.exit(1)

    customers, invoices = load_data()
    df = build_training_features(invoices, customers)
    clf, reg = train(df)
    save_models(clf, reg)

    log.info("=" * 60)
    log.info("Training complete! Models ready for inference.")
    log.info("=" * 60)


if __name__ == "__main__":
    main()
