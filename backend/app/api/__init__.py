"""API router package — aggregates all sub-routers."""

from fastapi import APIRouter

from .analytics import router as analytics_router
from .customers import router as customers_router
from .invoices import router as invoices_router
from .model_mgmt import router as models_router
from .predictions import router as predictions_router

api_router = APIRouter()

api_router.include_router(customers_router, prefix="/customers", tags=["Customers"])
api_router.include_router(invoices_router, prefix="/invoices", tags=["Invoices"])
api_router.include_router(predictions_router, prefix="/predictions", tags=["Predictions"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(models_router, prefix="/models", tags=["Model Management"])
