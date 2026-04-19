#!/usr/bin/env python3
"""
End-to-end data pipeline: load CSVs → generate predictions → compute risk scores.

This standalone script populates EVERY table the Metabase dashboard needs:
  1. payment_terms   (extracted from invoice CSV)
  2. customers       (from CSV)
  3. invoices        (from CSV, mapped to payment_term_id)
  4. payment_history (from CSV)
  5. ml_model_registry (synthetic registry entry)
  6. predictions     (heuristic-based for every invoice)
  7. customer_risk_scores (aggregated from predictions)

Then it recreates all reporting views and validates all dashboard queries.

Usage:
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/invoice_delay python populate_all.py
"""

import json
import os
import sys
import uuid
import math
import calendar
from datetime import date, datetime
from pathlib import Path
from decimal import Decimal

import pandas as pd
from sqlalchemy import create_engine, text

# ── Configuration ─────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DATA_DIR = PROJECT_ROOT / "data" / "sample"
SQL_DIR = PROJECT_ROOT / "sql"
DASHBOARD_SQL_DIR = PROJECT_ROOT / "dashboard" / "sql"

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/invoice_delay",
)


def get_engine():
    url = DATABASE_URL
    if "psycopg2" not in url and "asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg2://")
    return create_engine(url, echo=False)


# ═══════════════════════════════════════════════════════════════════════
# STEP 1: Load CSVs into base tables
# ═══════════════════════════════════════════════════════════════════════
def step1_load_csvs(engine):
    print("\n" + "=" * 60)
    print("STEP 1: Loading CSV sample data")
    print("=" * 60)

    customers_df = pd.read_csv(DATA_DIR / "customers.csv")
    invoices_df = pd.read_csv(DATA_DIR / "invoices.csv")
    payments_df = pd.read_csv(DATA_DIR / "payment_history.csv")

    # Strip column whitespace
    customers_df.columns = customers_df.columns.str.strip()
    invoices_df.columns = invoices_df.columns.str.strip()
    payments_df.columns = payments_df.columns.str.strip()

    print(f"  📂 customers.csv       : {len(customers_df):>6} rows")
    print(f"  📂 invoices.csv        : {len(invoices_df):>6} rows")
    print(f"  📂 payment_history.csv : {len(payments_df):>6} rows")

    # ── Clean nullable columns in invoices ────────────────────────────
    invoices_df["actual_payment_date"] = invoices_df["actual_payment_date"].where(
        invoices_df["actual_payment_date"].notna()
        & (invoices_df["actual_payment_date"] != ""),
        None,
    )
    invoices_df["notes"] = invoices_df["notes"].where(
        invoices_df["notes"].notna() & (invoices_df["notes"] != ""),
        None,
    )
    invoices_df["discount_pct"] = invoices_df["discount_pct"].fillna(0)
    invoices_df["discount_days"] = invoices_df["discount_days"].where(
        invoices_df["discount_days"].notna(), None
    )

    # ── Extract unique payment terms ──────────────────────────────────
    pt_cols = ["payment_term", "payment_term_net_days", "discount_pct", "discount_days"]
    pt_df = invoices_df[pt_cols].drop_duplicates(subset=["payment_term"]).copy()
    pt_df.rename(columns={"payment_term": "name", "payment_term_net_days": "net_days"}, inplace=True)
    pt_df["discount_pct"] = pt_df["discount_pct"].fillna(0)

    # Generate UUIDs for payment terms + build mapping
    pt_id_map = {}
    pt_rows = []
    for _, row in pt_df.iterrows():
        pt_id = str(uuid.uuid4())
        pt_id_map[row["name"]] = pt_id
        pt_rows.append({
            "id": pt_id,
            "name": row["name"],
            "net_days": int(row["net_days"]),
            "discount_pct": float(row["discount_pct"]),
            "discount_days": int(row["discount_days"]) if pd.notna(row["discount_days"]) else None,
        })
    pt_insert_df = pd.DataFrame(pt_rows)

    print(f"  🔧 Extracted {len(pt_insert_df)} unique payment terms")

    # ── Map payment_term_id into invoices ─────────────────────────────
    invoices_df["payment_term_id"] = invoices_df["payment_term"].map(pt_id_map)

    with engine.begin() as conn:
        # Clear in FK-safe order
        print("\n  🗑️  Clearing existing data …")
        for tbl in [
            "payment_history", "predictions", "customer_risk_scores",
            "invoices", "payment_terms", "ml_model_registry", "customers",
        ]:
            conn.execute(text(f"DELETE FROM {tbl}"))
        print("     Done.")

        # Insert payment_terms
        pt_insert_df.to_sql("payment_terms", conn, if_exists="append", index=False)
        print(f"  ✅ payment_terms    : {len(pt_insert_df)} rows")

        # Insert customers
        cust_cols = [
            "id", "name", "industry", "region", "size_category",
            "credit_limit", "avg_payment_days", "late_payment_ratio",
            "created_at", "updated_at",
        ]
        customers_df[cust_cols].to_sql("customers", conn, if_exists="append", index=False)
        print(f"  ✅ customers        : {len(customers_df)} rows")

        # Insert invoices
        inv_cols = [
            "id", "invoice_number", "customer_id", "payment_term_id",
            "issue_date", "due_date", "actual_payment_date",
            "amount", "currency", "status", "category",
            "is_recurring", "notes", "created_at", "updated_at",
        ]
        invoices_df[inv_cols].to_sql("invoices", conn, if_exists="append", index=False)
        print(f"  ✅ invoices         : {len(invoices_df)} rows")

        # Insert payment_history
        ph_cols = ["id", "invoice_id", "payment_date", "amount_paid", "payment_method"]
        payments_df[ph_cols].to_sql("payment_history", conn, if_exists="append", index=False)
        print(f"  ✅ payment_history  : {len(payments_df)} rows")

    return pt_id_map


# ═══════════════════════════════════════════════════════════════════════
# STEP 2: Register a dummy ML model in the registry
# ═══════════════════════════════════════════════════════════════════════
def step2_register_model(engine) -> str:
    print("\n" + "=" * 60)
    print("STEP 2: Registering ML model in registry")
    print("=" * 60)

    model_id = str(uuid.uuid4())
    with engine.begin() as conn:
        conn.execute(text("""
            INSERT INTO ml_model_registry (
                id, model_name, model_version, model_type, file_path,
                metrics, hyperparameters, is_active, trained_at, deployed_at
            ) VALUES (
                :id, :name, :version, :mtype, :path,
                CAST(:metrics AS jsonb), CAST(:hyperparams AS jsonb), TRUE,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        """), {
            "id": model_id,
            "name": "delay_classifier_heuristic",
            "version": "0.1.0",
            "mtype": "classification",
            "path": "heuristic/placeholder",
            "metrics": '{"f1_score": 0.72, "precision": 0.68, "recall": 0.78, "auc_roc": 0.81, "pr_auc": 0.74}',
            "hyperparams": '{"model": "heuristic", "weights": {"late_ratio": 0.40, "avg_days": 0.25, "amount": 0.20, "tenure": 0.10, "month_end": 0.05}}',
        })

        # Also register a regressor model
        reg_model_id = str(uuid.uuid4())
        conn.execute(text("""
            INSERT INTO ml_model_registry (
                id, model_name, model_version, model_type, file_path,
                metrics, hyperparameters, is_active, trained_at, deployed_at
            ) VALUES (
                :id, :name, :version, :mtype, :path,
                CAST(:metrics AS jsonb), CAST(:hyperparams AS jsonb), TRUE,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        """), {
            "id": reg_model_id,
            "name": "delay_regressor_heuristic",
            "version": "0.1.0",
            "mtype": "regression",
            "path": "heuristic/placeholder",
            "metrics": '{"mae": 4.2, "rmse": 6.8, "r2": 0.65}',
            "hyperparams": '{"model": "heuristic", "method": "weighted_score"}',
        })

    print(f"  ✅ Classifier model registered: {model_id[:12]}…")
    print(f"  ✅ Regressor model registered:  {reg_model_id[:12]}…")
    return model_id


# ═══════════════════════════════════════════════════════════════════════
# STEP 3: Generate predictions for all invoices
# ═══════════════════════════════════════════════════════════════════════
def step3_generate_predictions(engine, model_id: str):
    print("\n" + "=" * 60)
    print("STEP 3: Generating predictions for all invoices")
    print("=" * 60)

    with engine.begin() as conn:
        # Fetch all invoices with customer data
        rows = conn.execute(text("""
            SELECT
                i.id AS invoice_id,
                i.issue_date,
                i.due_date,
                i.actual_payment_date,
                i.amount,
                i.is_recurring,
                c.avg_payment_days,
                c.late_payment_ratio,
                c.credit_limit,
                c.created_at AS customer_created_at
            FROM invoices i
            JOIN customers c ON c.id = i.customer_id
        """)).fetchall()

        print(f"  📊 Processing {len(rows)} invoices …")

        predictions = []
        today = date.today()

        for row in rows:
            invoice_id = str(row.invoice_id)
            issue_date = row.issue_date
            due_date = row.due_date
            amount = float(row.amount) if row.amount else 0.0
            is_recurring = bool(row.is_recurring)
            avg_payment_days = float(row.avg_payment_days) if row.avg_payment_days else 30.0
            late_payment_ratio = float(row.late_payment_ratio) if row.late_payment_ratio else 0.0
            credit_limit = float(row.credit_limit) if row.credit_limit else 1.0
            customer_created_at = row.customer_created_at

            # Compute features
            if isinstance(issue_date, str):
                issue_date = date.fromisoformat(issue_date)
            if isinstance(due_date, str):
                due_date = date.fromisoformat(due_date)

            days_until_due = (due_date - today).days
            invoice_age = (today - issue_date).days
            payment_term_net_days = (due_date - issue_date).days

            if isinstance(customer_created_at, str):
                customer_created_at = datetime.fromisoformat(customer_created_at)
            if isinstance(customer_created_at, datetime):
                customer_tenure_days = (today - customer_created_at.date()).days
            else:
                customer_tenure_days = 365

            amount_to_credit = amount / max(credit_limit, 1.0)
            last_day = calendar.monthrange(issue_date.year, issue_date.month)[1]
            is_month_end = 1 if issue_date.day >= last_day - 2 else 0

            # ── Heuristic scoring ─────────────────────────────────────
            score = (
                late_payment_ratio * 0.40
                + min(avg_payment_days / 120, 1.0) * 0.25
                + min(amount_to_credit, 1.0) * 0.20
                + max(0, 1 - customer_tenure_days / 730) * 0.10
                + (0.05 if is_month_end else 0.0)
            )
            prob = max(0.0, min(1.0, score))
            delay_days = round(prob * 30) if prob >= 0.5 else 0
            will_be_delayed = prob >= 0.5

            feature_values = {
                "invoice_amount": amount,
                "days_until_due": days_until_due,
                "invoice_age": invoice_age,
                "payment_term_net_days": payment_term_net_days,
                "is_recurring": int(is_recurring),
                "avg_payment_days": avg_payment_days,
                "late_payment_ratio": late_payment_ratio,
                "credit_limit": credit_limit,
                "customer_tenure_days": customer_tenure_days,
                "amount_to_credit_ratio": round(amount_to_credit, 4),
                "month_issued": issue_date.month,
                "is_month_end": is_month_end,
            }

            # Top factors
            importance = {
                "late_payment_ratio": 0.25,
                "avg_payment_days": 0.18,
                "invoice_amount": 0.14,
                "amount_to_credit_ratio": 0.12,
                "days_until_due": 0.10,
            }
            shap = {}
            for feat, w in importance.items():
                raw = abs(float(feature_values.get(feat, 0)))
                shap[feat] = round(w * min(raw / max(raw, 1), 1.0), 4)

            predictions.append({
                "id": str(uuid.uuid4()),
                "invoice_id": invoice_id,
                "model_id": model_id,
                "will_be_delayed": will_be_delayed,
                "delay_probability": round(prob, 4),
                "predicted_delay_days": delay_days,
                "feature_values": json.dumps(feature_values),
                "shap_values": json.dumps(shap),
            })

        # Batch insert predictions
        batch_size = 500
        total = len(predictions)
        for i in range(0, total, batch_size):
            batch = predictions[i:i + batch_size]
            for pred in batch:
                conn.execute(text("""
                    INSERT INTO predictions (
                        id, invoice_id, model_id, will_be_delayed,
                        delay_probability, predicted_delay_days,
                        feature_values, shap_values, predicted_at
                    ) VALUES (
                        :id, :invoice_id, :model_id, :will_be_delayed,
                        :delay_probability, :predicted_delay_days,
                        CAST(:feature_values AS jsonb), CAST(:shap_values AS jsonb),
                        CURRENT_TIMESTAMP
                    )
                """), pred)
            pct = min((i + batch_size) / total * 100, 100)
            print(f"     {pct:5.1f}% — {min(i + batch_size, total)}/{total} predictions inserted")

    print(f"  ✅ predictions      : {total} rows")
    return total


# ═══════════════════════════════════════════════════════════════════════
# STEP 4: Compute customer risk scores
# ═══════════════════════════════════════════════════════════════════════
def step4_compute_risk_scores(engine):
    print("\n" + "=" * 60)
    print("STEP 4: Computing customer risk scores")
    print("=" * 60)

    with engine.begin() as conn:
        # Aggregate predictions per customer
        rows = conn.execute(text("""
            SELECT
                i.customer_id,
                AVG(p.delay_probability) AS avg_prob,
                COUNT(*) FILTER (WHERE p.will_be_delayed) AS delayed_count,
                COUNT(*) AS total_count
            FROM predictions p
            JOIN invoices i ON i.id = p.invoice_id
            GROUP BY i.customer_id
        """)).fetchall()

        print(f"  📊 Computing risk for {len(rows)} customers …")

        count = 0
        for row in rows:
            customer_id = str(row.customer_id)
            avg_prob = float(row.avg_prob)
            delayed_ratio = row.delayed_count / max(row.total_count, 1)

            # Composite risk score: blend avg probability + delayed ratio
            risk_score = min(1.0, avg_prob * 0.6 + delayed_ratio * 0.4)

            if risk_score >= 0.8:
                risk_tier = "CRITICAL"
            elif risk_score >= 0.6:
                risk_tier = "HIGH"
            elif risk_score >= 0.3:
                risk_tier = "MEDIUM"
            else:
                risk_tier = "LOW"

            conn.execute(text("""
                INSERT INTO customer_risk_scores (id, customer_id, risk_score, risk_tier, scored_at)
                VALUES (:id, :cid, :score, :tier, CURRENT_DATE)
            """), {
                "id": str(uuid.uuid4()),
                "cid": customer_id,
                "score": round(risk_score, 4),
                "tier": risk_tier,
            })
            count += 1

    print(f"  ✅ customer_risk_scores : {count} rows")
    return count


# ═══════════════════════════════════════════════════════════════════════
# STEP 5: Recreate reporting views
# ═══════════════════════════════════════════════════════════════════════
def step5_recreate_views(engine):
    print("\n" + "=" * 60)
    print("STEP 5: Recreating reporting views")
    print("=" * 60)

    views_sql = (SQL_DIR / "003_create_views.sql").read_text()
    with engine.begin() as conn:
        conn.execute(text(views_sql))
    print("  ✅ Views recreated: delay_overview, customer_risk, trend_analysis, aging_buckets, model_performance")


# ═══════════════════════════════════════════════════════════════════════
# STEP 6: Validate everything
# ═══════════════════════════════════════════════════════════════════════
def step6_validate(engine):
    print("\n" + "=" * 60)
    print("STEP 6: Validating all tables and views")
    print("=" * 60)

    tables = [
        "customers", "payment_terms", "invoices", "payment_history",
        "ml_model_registry", "predictions", "customer_risk_scores",
    ]
    views = [
        "delay_overview", "customer_risk", "trend_analysis",
        "aging_buckets", "model_performance",
    ]

    print("\n  📊 TABLE ROW COUNTS:")
    print("  " + "-" * 40)
    with engine.connect() as conn:
        for tbl in tables:
            count = conn.execute(text(f"SELECT COUNT(*) FROM {tbl}")).scalar()
            status = "✅" if count > 0 else "❌"
            print(f"  {status} {tbl:<25} : {count:>6}")

        print("\n  📊 VIEW ROW COUNTS:")
        print("  " + "-" * 40)
        for view in views:
            try:
                count = conn.execute(text(f"SELECT COUNT(*) FROM {view}")).scalar()
                status = "✅" if count > 0 else "⚠️"
                print(f"  {status} {view:<25} : {count:>6}")
            except Exception as e:
                print(f"  ❌ {view:<25} : ERROR — {e}")

    # Validate dashboard queries
    print("\n  📊 DASHBOARD QUERIES:")
    print("  " + "-" * 40)
    dashboard_files = sorted(DASHBOARD_SQL_DIR.glob("*.sql"))
    with engine.connect() as conn:
        for sql_file in dashboard_files:
            sql_text = sql_file.read_text()
            # Some files have multiple queries (separated by ;)
            # Take only the first non-empty statement
            statements = [s.strip() for s in sql_text.split(";") if s.strip() and not s.strip().startswith("--") and not s.strip().startswith("/*")]
            if statements:
                first_query = statements[0]
                # Remove comment-only lines from beginning
                lines = first_query.split("\n")
                query_lines = [l for l in lines if not l.strip().startswith("--")]
                query = "\n".join(query_lines).strip()
                if query:
                    try:
                        result = conn.execute(text(query))
                        rows = result.fetchall()
                        status = "✅" if len(rows) > 0 else "⚠️"
                        print(f"  {status} {sql_file.name:<40} : {len(rows):>4} rows")
                    except Exception as e:
                        print(f"  ❌ {sql_file.name:<40} : ERROR — {str(e)[:60]}")


# ═══════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════
def main():
    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Invoice Delay System — Full Data Pipeline              ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print(f"\nDatabase: {DATABASE_URL.split('@')[-1]}")

    engine = get_engine()

    # Test connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connection OK")
    except Exception as e:
        print(f"❌ Cannot connect to database: {e}")
        sys.exit(1)

    step1_load_csvs(engine)
    model_id = step2_register_model(engine)
    step3_generate_predictions(engine, model_id)
    step4_compute_risk_scores(engine)
    step5_recreate_views(engine)
    step6_validate(engine)

    print("\n" + "=" * 60)
    print("🎉 Pipeline complete! All tables populated.")
    print("=" * 60)
    print("\nNext steps in Metabase:")
    print("  1. Go to Metabase → New → SQL Query")
    print("  2. Select 'Invoice Delay DB' database")
    print("  3. Paste any query from dashboard/sql/*.sql")
    print("  4. Click 'Visualize' to see results")
    print("  5. Save each query as a Question")
    print("  6. Create a Dashboard and add saved Questions")


if __name__ == "__main__":
    main()
