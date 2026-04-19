"""CRUD endpoints for invoices."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.invoice import Invoice
from ..schemas.invoice import (
    InvoiceCreate,
    InvoiceListResponse,
    InvoiceResponse,
    InvoiceUpdate,
)

router = APIRouter()

VALID_STATUSES = {"draft", "issued", "partially_paid", "paid", "overdue", "cancelled"}


# ── CREATE ────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=InvoiceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new invoice",
)
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
) -> Invoice:
    if payload.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status '{payload.status}'. Must be one of: {', '.join(sorted(VALID_STATUSES))}",
        )
    if payload.due_date < payload.issue_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="due_date must be on or after issue_date",
        )

    invoice = Invoice(**payload.model_dump())
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


# ── READ (list) ───────────────────────────────────────────────────────

@router.get(
    "",
    response_model=InvoiceListResponse,
    summary="List invoices (paginated, filterable)",
)
def list_invoices(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    customer_id: uuid.UUID | None = Query(None, description="Filter by customer"),
    status_filter: str | None = Query(None, alias="status", description="Filter by status"),
    category: str | None = Query(None),
    currency: str | None = Query(None),
    is_recurring: bool | None = Query(None),
    db: Session = Depends(get_db),
) -> dict:
    query = select(Invoice)

    if customer_id:
        query = query.where(Invoice.customer_id == customer_id)
    if status_filter:
        query = query.where(Invoice.status == status_filter)
    if category:
        query = query.where(Invoice.category == category)
    if currency:
        query = query.where(Invoice.currency == currency)
    if is_recurring is not None:
        query = query.where(Invoice.is_recurring == is_recurring)

    total = db.scalar(select(func.count()).select_from(query.subquery()))

    rows = db.scalars(
        query.order_by(Invoice.issue_date.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    ).all()

    return {
        "items": rows,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


# ── READ (single) ────────────────────────────────────────────────────

@router.get(
    "/{invoice_id}",
    response_model=InvoiceResponse,
    summary="Get invoice by ID",
)
def get_invoice(
    invoice_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> Invoice:
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice {invoice_id} not found",
        )
    return invoice


# ── UPDATE ────────────────────────────────────────────────────────────

@router.put(
    "/{invoice_id}",
    response_model=InvoiceResponse,
    summary="Update an invoice (partial)",
)
def update_invoice(
    invoice_id: uuid.UUID,
    payload: InvoiceUpdate,
    db: Session = Depends(get_db),
) -> Invoice:
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice {invoice_id} not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    # Validate status if being changed
    if "status" in update_data and update_data["status"] not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status. Must be one of: {', '.join(sorted(VALID_STATUSES))}",
        )

    for field, value in update_data.items():
        setattr(invoice, field, value)

    db.commit()
    db.refresh(invoice)
    return invoice


# ── DELETE ────────────────────────────────────────────────────────────

@router.delete(
    "/{invoice_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an invoice",
)
def delete_invoice(
    invoice_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> None:
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice {invoice_id} not found",
        )
    db.delete(invoice)
    db.commit()
