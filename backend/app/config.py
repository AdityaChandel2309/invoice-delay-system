"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central settings object.

    Values are read from environment variables (case-insensitive) and,
    optionally, from a ``.env`` file located in the project root.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Database ──────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/invoice_delay"

    # ── Application ───────────────────────────────────────────────────
    APP_NAME: str = "Invoice Delay Prediction System"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # ── API ───────────────────────────────────────────────────────────
    API_V1_PREFIX: str = "/api/v1"

    # ── ML Models ─────────────────────────────────────────────────────
    ML_MODELS_DIR: str = "ml_models"

    @property
    def async_database_url(self) -> str:
        """Return an asyncpg-compatible URL (swap driver prefix)."""
        return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

    @property
    def sync_database_url(self) -> str:
        """Return a psycopg2-compatible URL (swap driver prefix)."""
        return self.DATABASE_URL.replace(
            "postgresql://", "postgresql+psycopg2://"
        )


# Singleton – import this wherever settings are needed.
settings = Settings()
