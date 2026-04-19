"""CRUD endpoints for customers."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.customer import Customer
from ..schemas.customer import (
    CustomerCreate,
    CustomerListResponse,
    CustomerResponse,
    CustomerUpdate,
)

router = APIRouter()


# ── CREATE ────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new customer",
)
def create_customer(
    payload: CustomerCreate,
    db: Session = Depends(get_db),
) -> Customer:
    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


# ── READ (list) ───────────────────────────────────────────────────────

@router.get(
    "",
    response_model=CustomerListResponse,
    summary="List customers (paginated)",
)
def list_customers(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    industry: str | None = Query(None, description="Filter by industry"),
    region: str | None = Query(None, description="Filter by region"),
    search: str | None = Query(None, description="Search by name (case-insensitive)"),
    db: Session = Depends(get_db),
) -> dict:
    query = select(Customer)

    # Optional filters
    if industry:
        query = query.where(Customer.industry == industry)
    if region:
        query = query.where(Customer.region == region)
    if search:
        query = query.where(Customer.name.ilike(f"%{search}%"))

    # Total count (before pagination)
    total = db.scalar(select(func.count()).select_from(query.subquery()))

    # Paginate
    rows = db.scalars(
        query.order_by(Customer.created_at.desc())
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
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Get customer by ID",
)
def get_customer(
    customer_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> Customer:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer {customer_id} not found",
        )
    return customer


# ── UPDATE ────────────────────────────────────────────────────────────

@router.put(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Update a customer (partial)",
)
def update_customer(
    customer_id: uuid.UUID,
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
) -> Customer:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer {customer_id} not found",
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return customer


# ── DELETE ────────────────────────────────────────────────────────────

@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a customer",
)
def delete_customer(
    customer_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> None:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer {customer_id} not found",
        )
    db.delete(customer)
    db.commit()
