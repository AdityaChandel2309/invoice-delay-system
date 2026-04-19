"""SQLAlchemy engine, session factory, and FastAPI dependency."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from .config import settings
from .models import Base  # re-export so callers can do `from app.database import Base`

# ── Engine ────────────────────────────────────────────────────────────
engine = create_engine(
    settings.sync_database_url,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # verify connections before checkout
    echo=settings.DEBUG,
)

# ── Session factory ───────────────────────────────────────────────────
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


# ── FastAPI dependency ────────────────────────────────────────────────
def get_db() -> Generator[Session, None, None]:
    """Yield a database session and ensure it is closed after the request.

    Usage::

        @router.get("/items")
        def list_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Re-export Base for convenience (e.g. Alembic env.py)
__all__ = ["Base", "SessionLocal", "engine", "get_db"]
