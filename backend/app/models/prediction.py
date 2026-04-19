from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, Optional

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, Numeric, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import Base


class Prediction(Base):
    __tablename__ = "predictions"
    __table_args__ = (
        CheckConstraint(
            "delay_probability >= 0 AND delay_probability <= 1",
            name="chk_predictions_delay_probability",
        ),
        CheckConstraint(
            "predicted_delay_days IS NULL OR predicted_delay_days >= 0",
            name="chk_predictions_delay_days",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    invoice_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
    )
    model_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ml_model_registry.id", ondelete="RESTRICT"),
        nullable=False,
    )
    will_be_delayed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    delay_probability: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    predicted_delay_days: Mapped[Optional[int]] = mapped_column(Integer)
    feature_values: Mapped[Dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )
    shap_values: Mapped[Dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )
    predicted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    invoice: Mapped["Invoice"] = relationship(
        "Invoice",
        back_populates="predictions",
    )
    model: Mapped["MLModelRegistry"] = relationship(
        "MLModelRegistry",
        back_populates="predictions",
    )
