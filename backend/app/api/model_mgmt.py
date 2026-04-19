"""Model management endpoints — register, list, activate ML models."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.model_registry import MLModelRegistry

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────

class ModelRegisterRequest(BaseModel):
    model_name: str = Field(..., min_length=1, max_length=150)
    model_version: str = Field(..., min_length=1, max_length=50)
    model_type: str = Field(..., pattern="^(classification|regression)$")
    file_path: str
    metrics: dict = Field(default_factory=dict)
    hyperparameters: dict = Field(default_factory=dict)
    is_active: bool = False


class ModelResponse(BaseModel):
    id: uuid.UUID
    model_name: str
    model_version: str
    model_type: str
    file_path: str
    metrics: dict
    hyperparameters: dict
    is_active: bool
    trained_at: datetime | None
    deployed_at: datetime | None

    model_config = {"from_attributes": True}


class ModelListResponse(BaseModel):
    items: list[ModelResponse]
    total: int


# ── REGISTER ──────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=ModelResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a trained model",
)
def register_model(
    payload: ModelRegisterRequest,
    db: Session = Depends(get_db),
) -> MLModelRegistry:
    model = MLModelRegistry(
        model_name=payload.model_name,
        model_version=payload.model_version,
        model_type=payload.model_type,
        file_path=payload.file_path,
        metrics=payload.metrics,
        hyperparameters=payload.hyperparameters,
        is_active=payload.is_active,
        trained_at=datetime.now(timezone.utc),
    )
    if payload.is_active:
        model.deployed_at = datetime.now(timezone.utc)

    db.add(model)
    db.commit()
    db.refresh(model)
    return model


# ── LIST ──────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=ModelListResponse,
    summary="List registered models",
)
def list_models(
    model_type: str | None = Query(None, description="Filter by type"),
    active_only: bool = Query(False, description="Only active models"),
    db: Session = Depends(get_db),
) -> dict:
    query = select(MLModelRegistry)

    if model_type:
        query = query.where(MLModelRegistry.model_type == model_type)
    if active_only:
        query = query.where(MLModelRegistry.is_active == True)  # noqa: E712

    total = db.scalar(select(func.count()).select_from(query.subquery()))
    rows = db.scalars(
        query.order_by(MLModelRegistry.is_active.desc(), MLModelRegistry.trained_at.desc())
    ).all()

    return {"items": rows, "total": total}


# ── ACTIVATE ──────────────────────────────────────────────────────────

@router.put(
    "/{model_id}/activate",
    response_model=ModelResponse,
    summary="Set model as active for inference",
)
def activate_model(
    model_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> MLModelRegistry:
    model = db.get(MLModelRegistry, model_id)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model {model_id} not found",
        )

    # Deactivate other models of the same type
    db.execute(
        select(MLModelRegistry)
        .where(MLModelRegistry.model_type == model.model_type)
        .where(MLModelRegistry.id != model_id)
    )
    for other in db.scalars(
        select(MLModelRegistry)
        .where(MLModelRegistry.model_type == model.model_type)
        .where(MLModelRegistry.id != model_id)
        .where(MLModelRegistry.is_active == True)  # noqa: E712
    ).all():
        other.is_active = False

    model.is_active = True
    model.deployed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(model)

    # Reload model from disk
    from ..ml.model_loader import model_loader
    model_loader.reload()

    return model


# ── METRICS ───────────────────────────────────────────────────────────

@router.get(
    "/{model_id}/metrics",
    summary="View training & live metrics for a model",
)
def model_metrics(
    model_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> dict:
    model = db.get(MLModelRegistry, model_id)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model {model_id} not found",
        )

    # Count predictions made with this model
    from ..models.prediction import Prediction
    pred_count = db.scalar(
        select(func.count()).where(Prediction.model_id == model_id)
    )

    return {
        "model_id": model.id,
        "model_name": model.model_name,
        "model_version": model.model_version,
        "model_type": model.model_type,
        "is_active": model.is_active,
        "training_metrics": model.metrics,
        "hyperparameters": model.hyperparameters,
        "total_predictions": pred_count or 0,
        "trained_at": model.trained_at,
        "deployed_at": model.deployed_at,
    }
