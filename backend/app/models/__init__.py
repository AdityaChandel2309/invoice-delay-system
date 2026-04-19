from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from .customer import Customer
from .customer_risk_score import CustomerRiskScore
from .invoice import Invoice
from .model_registry import MLModelRegistry
from .payment_history import PaymentHistory
from .payment_term import PaymentTerm
from .prediction import Prediction

__all__ = [
    "Base",
    "Customer",
    "CustomerRiskScore",
    "Invoice",
    "MLModelRegistry",
    "PaymentHistory",
    "PaymentTerm",
    "Prediction",
]
