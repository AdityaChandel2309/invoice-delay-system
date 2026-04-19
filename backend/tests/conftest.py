"""Shared test fixtures and configuration.

Uses an in-memory SQLite database so tests don't touch PostgreSQL.
PostgreSQL-specific features (JSONB, UUID, char_length) are patched
for SQLite compatibility.
"""

import os
import sys
from collections.abc import Generator

import pytest
import sqlalchemy
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, JSON
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# ── Patch JSONB → JSON for SQLite before importing models ─────────────
from sqlalchemy.dialects import postgresql

postgresql.JSONB = JSON  # type: ignore[attr-defined]

from app.database import get_db
from app.main import app
from app.models import Base


# ── In-memory SQLite engine for tests ─────────────────────────────────

TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


# Enable foreign keys in SQLite (off by default)
@event.listens_for(TEST_ENGINE, "connect")
def _set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


TestingSessionLocal = sessionmaker(bind=TEST_ENGINE, autocommit=False, autoflush=False)


# ── Helpers ───────────────────────────────────────────────────────────

_PG_ONLY_FUNCS = ("char_length",)


def _strip_pg_checks():
    """Remove CHECK constraints that use PG-only SQL functions."""
    for table in Base.metadata.tables.values():
        table.constraints = {
            c
            for c in table.constraints
            if not (
                isinstance(c, sqlalchemy.CheckConstraint)
                and any(fn in str(c.sqltext) for fn in _PG_ONLY_FUNCS)
            )
        }


# ── Fixtures ──────────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def setup_database():
    """Create all tables before each test, drop after."""
    _strip_pg_checks()
    Base.metadata.create_all(bind=TEST_ENGINE)
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """Yield a fresh database session for direct ORM testing."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session: Session) -> TestClient:
    """TestClient with the DB dependency overridden to use SQLite."""
    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
