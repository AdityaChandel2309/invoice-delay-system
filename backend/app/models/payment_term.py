from __future__ import annotations

import uuid
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import CheckConstraint, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import Base


class PaymentTerm(Base):
    __tablename__ = "payment_terms"
    __table_args__ = (
        CheckConstraint("net_days >= 0", name="chk_payment_terms_net_days"),
        CheckConstraint(
            "discount_pct >= 0 AND discount_pct <= 100",
            name="chk_payment_terms_discount_pct",
        ),
        CheckConstraint(
            "discount_days IS NULL OR discount_days >= 0",
            name="chk_payment_terms_discount_days",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    net_days: Mapped[int] = mapped_column(Integer, nullable=False)
    discount_pct: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
        server_default=text("0"),
    )
    discount_days: Mapped[Optional[int]] = mapped_column(Integer)

    invoices: Mapped[List["Invoice"]] = relationship(
        "Invoice",
        back_populates="payment_term",
    )
