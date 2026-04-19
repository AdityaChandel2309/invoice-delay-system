"""Run inference — real models when available, heuristic fallback otherwise.

The public entry points are :func:`predict_single` and
:func:`predict_batch`.  Both return plain dicts so the caller (the API
layer) can build Pydantic response objects without coupling to this
module's internals.
"""

from __future__ import annotations

import logging
import random
from dataclasses import dataclass, field
from datetime import date
from typing import Any

import numpy as np
import pandas as pd

from ..models.customer import Customer
from ..models.invoice import Invoice
from .feature_engineering import FEATURE_COLUMNS, build_features, build_features_batch
from .model_loader import model_loader

logger = logging.getLogger(__name__)


# ── Result container ──────────────────────────────────────────────────

@dataclass
class PredictionResult:
    """Plain-data container returned by the predictor."""

    will_be_delayed: bool
    delay_probability: float
    predicted_delay_days: int
    risk_tier: str
    top_factors: list[dict[str, Any]]
    feature_values: dict[str, Any]
    shap_values: dict[str, float]
    model_version: str


# ── Helpers ───────────────────────────────────────────────────────────

def _risk_tier(probability: float) -> str:
    if probability >= 0.8:
        return "CRITICAL"
    if probability >= 0.6:
        return "HIGH"
    if probability >= 0.3:
        return "MEDIUM"
    return "LOW"


def _top_factors_from_features(features: dict[str, Any]) -> list[dict[str, Any]]:
    """Produce a ranked placeholder factor list from raw feature values.

    When SHAP is available (Phase 3+) this will be replaced by real
    SHAP-based attributions.
    """
    # Weight map — rough domain-knowledge importance
    importance_weights: dict[str, float] = {
        "late_payment_ratio": 0.25,
        "avg_payment_days": 0.18,
        "invoice_amount": 0.14,
        "amount_to_credit_ratio": 0.12,
        "days_until_due": 0.10,
        "customer_tenure_days": 0.06,
        "invoice_age": 0.05,
        "is_recurring": 0.04,
        "is_month_end": 0.03,
        "payment_term_net_days": 0.02,
        "month_issued": 0.01,
    }

    factors = []
    for feat, weight in importance_weights.items():
        raw = features.get(feat, 0)
        # Normalise to [0, 1] loosely so the "impact" is comparable
        try:
            normalised = abs(float(raw))
        except (TypeError, ValueError):
            normalised = 0.0

        factors.append({
            "feature": feat,
            "impact": round(weight * min(normalised / max(normalised, 1), 1.0), 4),
        })

    factors.sort(key=lambda f: f["impact"], reverse=True)
    return factors[:5]


# ── Placeholder heuristic (no trained model) ──────────────────────────

def _placeholder_inference(features_df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
    """Score a batch using a simple rule-based heuristic.

    Returns (probabilities, delay_days) arrays aligned with rows in
    *features_df*.
    """
    probabilities = []
    delay_days = []

    for _, row in features_df.iterrows():
        late_ratio = row.get("late_payment_ratio", 0.0)
        avg_days = row.get("avg_payment_days", 30.0)
        amount = row.get("invoice_amount", 0.0)
        credit = row.get("credit_limit", 1.0)
        tenure = row.get("customer_tenure_days", 365)

        # Weighted score
        score = (
            late_ratio * 0.40
            + min(avg_days / 120, 1.0) * 0.25
            + min(amount / max(credit, 1), 1.0) * 0.20
            + max(0, 1 - tenure / 730) * 0.10  # newer customers riskier
            + (0.05 if row.get("is_month_end", 0) else 0.0)
        )
        prob = max(0.0, min(1.0, score))
        days = round(prob * 30) if prob >= 0.5 else 0
        probabilities.append(prob)
        delay_days.append(days)

    return np.array(probabilities), np.array(delay_days)


# ── Real model inference ──────────────────────────────────────────────

def _model_inference(features_df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
    """Score a batch using the trained classifier + regressor."""
    clf = model_loader.classifier
    reg = model_loader.regressor

    # Classifier → probability of delay (class 1)
    proba = clf.predict_proba(features_df)[:, 1]

    # Regressor → predicted delay days (clamp to >= 0)
    days = reg.predict(features_df)
    days = np.clip(np.round(days).astype(int), 0, None)

    # If classifier says "not delayed", zero out the days
    predicted_delayed = proba >= 0.5
    days = np.where(predicted_delayed, days, 0)

    return proba, days


# ── Public API ────────────────────────────────────────────────────────

def predict_single(
    invoice: Invoice,
    customer: Customer,
    *,
    reference_date: date | None = None,
    overrides: dict[str, Any] | None = None,
) -> PredictionResult:
    """Generate a prediction for one invoice.

    Parameters
    ----------
    invoice, customer:
        ORM objects.
    reference_date:
        Optional pinned date for feature computation.
    overrides:
        Feature-value overrides for what-if analysis.
    """
    features_df = build_features(
        invoice, customer,
        reference_date=reference_date,
        overrides=overrides,
    )

    use_models = model_loader.has_models
    model_version = "placeholder-v0.1.0"

    if use_models:
        proba, days = _model_inference(features_df)
        model_version = "trained-v1.0.0"  # TODO: read from registry
    else:
        proba, days = _placeholder_inference(features_df)

    prob = float(proba[0])
    delay = int(days[0])
    will_be_delayed = prob >= 0.5

    feature_values = features_df.iloc[0].to_dict()
    top_factors = _top_factors_from_features(feature_values)
    shap_dict = {f["feature"]: f["impact"] for f in top_factors}

    return PredictionResult(
        will_be_delayed=will_be_delayed,
        delay_probability=round(prob, 4),
        predicted_delay_days=delay,
        risk_tier=_risk_tier(prob),
        top_factors=top_factors,
        feature_values=feature_values,
        shap_values=shap_dict,
        model_version=model_version,
    )


def predict_batch(
    pairs: list[tuple[Invoice, Customer]],
    *,
    reference_date: date | None = None,
) -> list[PredictionResult]:
    """Generate predictions for many invoices at once.

    Parameters
    ----------
    pairs:
        List of ``(invoice, customer)`` tuples.
    """
    if not pairs:
        return []

    features_df = build_features_batch(pairs, reference_date=reference_date)

    use_models = model_loader.has_models
    model_version = "placeholder-v0.1.0"

    if use_models:
        probas, days_arr = _model_inference(features_df)
        model_version = "trained-v1.0.0"
    else:
        probas, days_arr = _placeholder_inference(features_df)

    results: list[PredictionResult] = []
    for idx in range(len(pairs)):
        prob = float(probas[idx])
        delay = int(days_arr[idx])
        will_be_delayed = prob >= 0.5
        feature_values = features_df.iloc[idx].to_dict()
        top_factors = _top_factors_from_features(feature_values)
        shap_dict = {f["feature"]: f["impact"] for f in top_factors}

        results.append(
            PredictionResult(
                will_be_delayed=will_be_delayed,
                delay_probability=round(prob, 4),
                predicted_delay_days=delay,
                risk_tier=_risk_tier(prob),
                top_factors=top_factors,
                feature_values=feature_values,
                shap_values=shap_dict,
                model_version=model_version,
            )
        )

    return results
