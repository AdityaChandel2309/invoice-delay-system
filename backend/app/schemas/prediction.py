"""Pydantic schemas for Prediction endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Request schemas ───────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    """Body for POST /predictions/single."""

    invoice_id: uuid.UUID
    features_override: Optional[dict[str, Any]] = Field(
        default=None,
        description="Optional overrides for computed features (useful for what-if analysis).",
    )


class BatchPredictionRequest(BaseModel):
    """Body for POST /predictions/batch."""

    invoice_ids: list[uuid.UUID] = Field(..., min_length=1, max_length=500)


# ── Response schemas ──────────────────────────────────────────────────

class TopFactor(BaseModel):
    """A single SHAP-based feature attribution."""

    feature: str
    impact: float


class PredictionResponse(BaseModel):
    """Result of a single-invoice prediction."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    invoice_id: uuid.UUID
    will_be_delayed: bool
    delay_probability: float = Field(..., ge=0, le=1)
    predicted_delay_days: Optional[int] = Field(None, ge=0)
    risk_tier: str = Field(..., description="LOW | MEDIUM | HIGH | CRITICAL")
    top_factors: list[TopFactor]
    model_version: str
    predicted_at: datetime


class BatchPredictionResponse(BaseModel):
    """Wrapper for multiple prediction results."""

    predictions: list[PredictionResponse]
    total: int


class PredictionHistoryResponse(BaseModel):
    """Paginated list of past predictions."""

    items: list[PredictionResponse]
    total: int
    page: int
    per_page: int
