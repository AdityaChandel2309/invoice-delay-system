from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import Base


class CustomerRiskScore(Base):
    __tablename__ = "customer_risk_scores"
    __table_args__ = (
        CheckConstraint("risk_score >= 0 AND risk_score <= 1", name="chk_customer_risk_scores_score"),
        CheckConstraint(
            "risk_tier IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')",
            name="chk_customer_risk_scores_tier",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
    )
    risk_score: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    risk_tier: Mapped[str] = mapped_column(String(20), nullable=False)
    scored_at: Mapped[date] = mapped_column(Date, nullable=False)

    customer: Mapped["Customer"] = relationship(
        "Customer",
        back_populates="risk_scores",
    )
