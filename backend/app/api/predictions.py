"""Prediction endpoints — delegates to ``app.ml.predictor`` for inference."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..ml.predictor import predict_batch as ml_predict_batch
from ..ml.predictor import predict_single as ml_predict_single
from ..models.customer import Customer
from ..models.invoice import Invoice
from ..models.prediction import Prediction
from ..schemas.prediction import (
    BatchPredictionRequest,
    BatchPredictionResponse,
    PredictionHistoryResponse,
    PredictionRequest,
    PredictionResponse,
    TopFactor,
)

router = APIRouter()

# Placeholder model UUID used until a real model is registered in the DB.
_PLACEHOLDER_MODEL_ID = uuid.UUID("00000000-0000-0000-0000-000000000000")


# ── Helpers ───────────────────────────────────────────────────────────

def _risk_tier(probability: float) -> str:
    """Map delay probability to a human-readable risk tier."""
    if probability >= 0.8:
        return "CRITICAL"
    if probability >= 0.6:
        return "HIGH"
    if probability >= 0.3:
        return "MEDIUM"
    return "LOW"


def _resolve_invoice_customer(
    invoice_id: uuid.UUID,
    db: Session,
) -> tuple[Invoice, Customer]:
    """Fetch an invoice and its associated customer, or raise 404."""
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice {invoice_id} not found",
        )

    customer = db.get(Customer, invoice.customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer {invoice.customer_id} not found",
        )

    return invoice, customer


def _persist_and_respond(
    result,  # PredictionResult from ml.predictor
    invoice: Invoice,
    db: Session,
) -> PredictionResponse:
    """Write a Prediction row to the DB and return an API response."""
    prediction = Prediction(
        invoice_id=invoice.id,
        model_id=_PLACEHOLDER_MODEL_ID,
        will_be_delayed=result.will_be_delayed,
        delay_probability=result.delay_probability,
        predicted_delay_days=result.predicted_delay_days,
        feature_values=result.feature_values,
        shap_values=result.shap_values,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return PredictionResponse(
        id=prediction.id,
        invoice_id=prediction.invoice_id,
        will_be_delayed=prediction.will_be_delayed,
        delay_probability=float(prediction.delay_probability),
        predicted_delay_days=prediction.predicted_delay_days,
        risk_tier=result.risk_tier,
        top_factors=[
            TopFactor(feature=f["feature"], impact=f["impact"])
            for f in result.top_factors
        ],
        model_version=result.model_version,
        predicted_at=prediction.predicted_at,
    )


def _prediction_to_response(p: Prediction) -> PredictionResponse:
    """Convert a DB Prediction row into an API response."""
    return PredictionResponse(
        id=p.id,
        invoice_id=p.invoice_id,
        will_be_delayed=p.will_be_delayed,
        delay_probability=float(p.delay_probability),
        predicted_delay_days=p.predicted_delay_days,
        risk_tier=_risk_tier(float(p.delay_probability)),
        top_factors=[
            TopFactor(feature=k, impact=v)
            for k, v in (p.shap_values or {}).items()
        ],
        # TODO: join with ml_model_registry to get real version
        model_version="unknown",
        predicted_at=p.predicted_at,
    )


# ── SINGLE prediction ────────────────────────────────────────────────

@router.post(
    "/single",
    response_model=PredictionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Predict delay for a single invoice",
)
def predict_single(
    payload: PredictionRequest,
    db: Session = Depends(get_db),
) -> PredictionResponse:
    invoice, customer = _resolve_invoice_customer(payload.invoice_id, db)

    result = ml_predict_single(
        invoice,
        customer,
        overrides=payload.features_override,
    )

    return _persist_and_respond(result, invoice, db)


# ── BATCH prediction ─────────────────────────────────────────────────

@router.post(
    "/batch",
    response_model=BatchPredictionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Predict delay for multiple invoices",
)
def predict_batch(
    payload: BatchPredictionRequest,
    db: Session = Depends(get_db),
) -> dict:
    # Resolve all invoice/customer pairs up-front
    pairs: list[tuple[Invoice, Customer]] = []
    for inv_id in payload.invoice_ids:
        invoice, customer = _resolve_invoice_customer(inv_id, db)
        pairs.append((invoice, customer))

    results = ml_predict_batch(pairs)

    responses = [
        _persist_and_respond(result, invoice, db)
        for result, (invoice, _) in zip(results, pairs)
    ]

    return {"predictions": responses, "total": len(responses)}


# ── GET prediction for an invoice ─────────────────────────────────────

@router.get(
    "/{invoice_id}",
    response_model=PredictionResponse,
    summary="Get the latest prediction for an invoice",
)
def get_prediction(
    invoice_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> PredictionResponse:
    prediction = db.scalars(
        select(Prediction)
        .where(Prediction.invoice_id == invoice_id)
        .order_by(Prediction.predicted_at.desc())
        .limit(1)
    ).first()

    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No prediction found for invoice {invoice_id}",
        )

    return _prediction_to_response(prediction)


# ── Prediction history ────────────────────────────────────────────────

@router.get(
    "/history/",
    response_model=PredictionHistoryResponse,
    summary="List all predictions (paginated)",
)
def prediction_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    invoice_id: uuid.UUID | None = Query(None, description="Filter by invoice"),
    db: Session = Depends(get_db),
) -> dict:
    query = select(Prediction)

    if invoice_id:
        query = query.where(Prediction.invoice_id == invoice_id)

    total = db.scalar(select(func.count()).select_from(query.subquery()))

    rows = db.scalars(
        query.order_by(Prediction.predicted_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    ).all()

    items = [_prediction_to_response(p) for p in rows]

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
    }
