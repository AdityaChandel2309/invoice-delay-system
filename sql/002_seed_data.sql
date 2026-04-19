-- ============================================================================
-- SEED DATA — minimal reference data for fresh installs
-- ============================================================================
-- This script is idempotent (uses ON CONFLICT DO NOTHING).
-- For full sample data, use: python backend/populate_all.py
-- ============================================================================

BEGIN;

-- ── Payment Terms ────────────────────────────────────────────────────

INSERT INTO payment_terms (name, net_days, discount_pct, discount_days) VALUES
    ('Net 15',  15, 0.00, NULL),
    ('Net 30',  30, 0.00, NULL),
    ('Net 45',  45, 0.00, NULL),
    ('Net 60',  60, 0.00, NULL),
    ('Net 90',  90, 0.00, NULL),
    ('2/10 Net 30', 30, 2.00, 10),
    ('1/10 Net 60', 60, 1.00, 10)
ON CONFLICT (name) DO NOTHING;


-- ── ML Model Registry — placeholder entries ──────────────────────────

INSERT INTO ml_model_registry (
    id, model_name, model_version, model_type, file_path, metrics,
    hyperparameters, is_active, trained_at, deployed_at
) VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'xgboost-classifier', 'v1.0.0', 'classification',
        'ml_models/classifier/model.joblib',
        '{"accuracy": 0.89, "f1": 0.86, "roc_auc": 0.93}'::jsonb,
        '{"n_estimators": 300, "max_depth": 6, "learning_rate": 0.05}'::jsonb,
        TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'xgboost-regressor', 'v1.0.0', 'regression',
        'ml_models/regressor/model.joblib',
        '{"mae": 4.2, "rmse": 6.8, "r2": 0.72}'::jsonb,
        '{"n_estimators": 300, "max_depth": 6, "learning_rate": 0.05}'::jsonb,
        TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
ON CONFLICT DO NOTHING;

COMMIT;
