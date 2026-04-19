"""Pydantic schemas for Customer endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Request schemas ───────────────────────────────────────────────────

class CustomerCreate(BaseModel):
    """Body for POST /customers."""

    name: str = Field(..., min_length=1, max_length=255, examples=["Acme Corp"])
    industry: Optional[str] = Field(None, max_length=100, examples=["Manufacturing"])
    region: Optional[str] = Field(None, max_length=100, examples=["North America"])
    size_category: Optional[str] = Field(None, max_length=50, examples=["Enterprise"])
    credit_limit: Optional[Decimal] = Field(None, ge=0, examples=[500000.00])
    avg_payment_days: Optional[Decimal] = Field(None, ge=0, examples=[32.50])
    late_payment_ratio: Optional[Decimal] = Field(None, ge=0, le=1, examples=[0.15])


class CustomerUpdate(BaseModel):
    """Body for PUT /customers/{id}.  All fields optional (partial update)."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    industry: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    size_category: Optional[str] = Field(None, max_length=50)
    credit_limit: Optional[Decimal] = Field(None, ge=0)
    avg_payment_days: Optional[Decimal] = Field(None, ge=0)
    late_payment_ratio: Optional[Decimal] = Field(None, ge=0, le=1)


# ── Response schemas ──────────────────────────────────────────────────

class CustomerResponse(BaseModel):
    """Serialised customer returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    industry: Optional[str] = None
    region: Optional[str] = None
    size_category: Optional[str] = None
    credit_limit: Optional[Decimal] = None
    avg_payment_days: Optional[Decimal] = None
    late_payment_ratio: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime


class CustomerListResponse(BaseModel):
    """Paginated list wrapper."""

    items: list[CustomerResponse]
    total: int
    page: int
    per_page: int
