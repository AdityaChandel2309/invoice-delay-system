from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import Boolean, CheckConstraint, Date, DateTime, ForeignKey, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import Base


class Invoice(Base):
    __tablename__ = "invoices"
    __table_args__ = (
        CheckConstraint("amount >= 0", name="chk_invoices_amount"),
        CheckConstraint("due_date >= issue_date", name="chk_invoice_due_date"),
        CheckConstraint(
            "actual_payment_date IS NULL OR actual_payment_date >= issue_date",
            name="chk_invoice_payment_date",
        ),
        CheckConstraint(
            "currency = UPPER(currency) AND char_length(currency) = 3",
            name="chk_invoice_currency_format",
        ),
        CheckConstraint(
            "status IN ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled')",
            name="chk_invoice_status",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    invoice_number: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="RESTRICT"),
        nullable=False,
    )
    payment_term_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("payment_terms.id", ondelete="RESTRICT"),
        nullable=False,
    )
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    actual_payment_date: Mapped[Optional[date]] = mapped_column(Date)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    is_recurring: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    customer: Mapped["Customer"] = relationship(
        "Customer",
        back_populates="invoices",
    )
    payment_term: Mapped["PaymentTerm"] = relationship(
        "PaymentTerm",
        back_populates="invoices",
    )
    predictions: Mapped[List["Prediction"]] = relationship(
        "Prediction",
        back_populates="invoice",
        cascade="all, delete-orphan",
    )
    payment_history: Mapped[List["PaymentHistory"]] = relationship(
        "PaymentHistory",
        back_populates="invoice",
        cascade="all, delete-orphan",
    )
