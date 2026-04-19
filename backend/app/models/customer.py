from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import DateTime, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    industry: Mapped[Optional[str]] = mapped_column(String(100))
    region: Mapped[Optional[str]] = mapped_column(String(100))
    size_category: Mapped[Optional[str]] = mapped_column(String(50))
    credit_limit: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2))
    avg_payment_days: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2))
    late_payment_ratio: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4))
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

    invoices: Mapped[List["Invoice"]] = relationship(
        "Invoice",
        back_populates="customer",
    )
    risk_scores: Mapped[List["CustomerRiskScore"]] = relationship(
        "CustomerRiskScore",
        back_populates="customer",
        cascade="all, delete-orphan",
    )
