"""FastAPI application entry-point.

Initialises the app, mounts all API routers, configures CORS,
and exposes startup/shutdown lifecycle hooks.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import api_router
from .config import settings
from .database import Base, engine

logger = logging.getLogger(__name__)


# ── Lifecycle ─────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    # ── Startup ───────────────────────────────────────────────────────
    logger.info("Creating database tables (if they don't exist)…")
    Base.metadata.create_all(bind=engine)

    # Eagerly load ML models so the first request isn't slow
    from .ml.model_loader import model_loader  # noqa: E402

    if model_loader.has_models:
        logger.info("ML models loaded — real inference is active.")
    else:
        logger.warning("ML models not found — using placeholder heuristic.")

    logger.info("%s v%s is ready.", settings.APP_NAME, settings.APP_VERSION)

    yield

    # ── Shutdown ──────────────────────────────────────────────────────
    logger.info("Shutting down…")


# ── Application ───────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Predict whether invoices will be paid late and by how many days. "
        "Powered by XGBoost models with real-time feature engineering."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# ── Root & health ─────────────────────────────────────────────────────

@app.get("/", tags=["Root"], include_in_schema=False)
def root() -> dict:
    """Redirect-friendly root that confirms the service is up."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check() -> dict:
    """Simple liveness probe for orchestrators and load-balancers."""
    from .ml.model_loader import model_loader  # noqa: E402

    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "ml_models_loaded": model_loader.has_models,
    }
