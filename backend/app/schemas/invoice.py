"""Pydantic schemas for Invoice endpoints."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Request schemas ───────────────────────────────────────────────────

class InvoiceCreate(BaseModel):
    """Body for POST /invoices."""

    invoice_number: str = Field(..., min_length=1, max_length=100, examples=["INV-2026-0001"])
    customer_id: uuid.UUID
    payment_term_id: uuid.UUID
    issue_date: date
    due_date: date
    actual_payment_date: Optional[date] = None
    amount: Decimal = Field(..., ge=0, examples=[12500.00])
    currency: str = Field(..., min_length=3, max_length=3, examples=["USD"])
    status: str = Field(
        ...,
        examples=["issued"],
        description="One of: draft, issued, partially_paid, paid, overdue, cancelled",
    )
    category: Optional[str] = Field(None, max_length=100, examples=["Services"])
    is_recurring: bool = False
    notes: Optional[str] = None


class InvoiceUpdate(BaseModel):
    """Body for PUT /invoices/{id}.  All fields optional (partial update)."""

    invoice_number: Optional[str] = Field(None, min_length=1, max_length=100)
    customer_id: Optional[uuid.UUID] = None
    payment_term_id: Optional[uuid.UUID] = None
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    actual_payment_date: Optional[date] = None
    amount: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    status: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    is_recurring: Optional[bool] = None
    notes: Optional[str] = None


# ── Response schemas ──────────────────────────────────────────────────

class InvoiceResponse(BaseModel):
    """Serialised invoice returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    invoice_number: str
    customer_id: uuid.UUID
    payment_term_id: uuid.UUID
    issue_date: date
    due_date: date
    actual_payment_date: Optional[date] = None
    amount: Decimal
    currency: str
    status: str
    category: Optional[str] = None
    is_recurring: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class InvoiceListResponse(BaseModel):
    """Paginated list wrapper."""

    items: list[InvoiceResponse]
    total: int
    page: int
    per_page: int
