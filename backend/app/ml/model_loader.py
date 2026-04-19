"""Load and cache serialised ML models from disk.

Models are expected as ``joblib`` files under the directory configured
by ``settings.ML_MODELS_DIR``:

    ml_models/
    ├── classifier/
    │   └── model.joblib     # scikit-learn–compatible classifier
    └── regressor/
        └── model.joblib     # scikit-learn–compatible regressor

The loader is designed as a singleton so that models are read from disk
only *once* and then served from memory for all subsequent predictions.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any, Optional

import joblib

from ..config import settings

logger = logging.getLogger(__name__)


class ModelLoader:
    """Thread-safe, lazy-loading cache for classifier + regressor."""

    def __init__(self, models_dir: str | Path | None = None) -> None:
        self._base_dir = Path(models_dir or settings.ML_MODELS_DIR)
        self._classifier: Optional[Any] = None
        self._regressor: Optional[Any] = None
        self._classifier_loaded: bool = False
        self._regressor_loaded: bool = False

    # ── Paths ─────────────────────────────────────────────────────────

    @property
    def classifier_path(self) -> Path:
        return self._base_dir / "classifier" / "model.joblib"

    @property
    def regressor_path(self) -> Path:
        return self._base_dir / "regressor" / "model.joblib"

    # ── Public API ────────────────────────────────────────────────────

    @property
    def classifier(self) -> Optional[Any]:
        """Return the classification model, or ``None`` if not on disk."""
        if not self._classifier_loaded:
            self._classifier = self._load(self.classifier_path, label="classifier")
            self._classifier_loaded = True
        return self._classifier

    @property
    def regressor(self) -> Optional[Any]:
        """Return the regression model, or ``None`` if not on disk."""
        if not self._regressor_loaded:
            self._regressor = self._load(self.regressor_path, label="regressor")
            self._regressor_loaded = True
        return self._regressor

    @property
    def has_classifier(self) -> bool:
        return self.classifier is not None

    @property
    def has_regressor(self) -> bool:
        return self.regressor is not None

    @property
    def has_models(self) -> bool:
        """True if *both* classifier and regressor are available."""
        return self.has_classifier and self.has_regressor

    def reload(self) -> None:
        """Force re-read from disk (e.g. after a new model is deployed)."""
        self._classifier_loaded = False
        self._regressor_loaded = False
        self._classifier = None
        self._regressor = None
        logger.info("Model cache cleared — models will be reloaded on next access.")

    # ── Internal ──────────────────────────────────────────────────────

    @staticmethod
    def _load(path: Path, *, label: str) -> Optional[Any]:
        if not path.exists():
            logger.warning(
                "No %s found at %s — placeholder logic will be used.",
                label,
                path,
            )
            return None

        try:
            model = joblib.load(path)
            logger.info("Loaded %s from %s", label, path)
            return model
        except Exception:
            logger.exception("Failed to load %s from %s", label, path)
            return None


# ── Module-level singleton ────────────────────────────────────────────
model_loader = ModelLoader()
