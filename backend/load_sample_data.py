"""
Load sample CSV data into the PostgreSQL database.

Usage:
    python -m load_sample_data          (from backend/)
    python load_sample_data.py          (from backend/)

Requires DATABASE_URL environment variable.
"""

import os
import sys
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine, text

# ── Resolve paths ─────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR.parent / "data" / "sample"

CUSTOMERS_CSV = DATA_DIR / "customers.csv"
INVOICES_CSV = DATA_DIR / "invoices.csv"
PAYMENT_HISTORY_CSV = DATA_DIR / "payment_history.csv"

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/invoice_delay",
)


def main() -> None:
    print(f"Connecting to: {DATABASE_URL.split('@')[-1]}")
    engine = create_engine(DATABASE_URL)

    # ── Load CSVs ─────────────────────────────────────────────────────
    print("\n📂 Reading CSV files …")
    customers_df = pd.read_csv(CUSTOMERS_CSV)
    invoices_df = pd.read_csv(INVOICES_CSV)
    payments_df = pd.read_csv(PAYMENT_HISTORY_CSV)

    print(f"   customers.csv        : {len(customers_df):>6} rows")
    print(f"   invoices.csv         : {len(invoices_df):>6} rows")
    print(f"   payment_history.csv  : {len(payments_df):>6} rows")

    # ── Clean data ────────────────────────────────────────────────────
    # Customers
    customers_df.columns = customers_df.columns.str.strip()

    # Invoices
    invoices_df.columns = invoices_df.columns.str.strip()
    # Replace empty strings and "nan" with None for nullable columns
    invoices_df["actual_payment_date"] = invoices_df["actual_payment_date"].where(
        invoices_df["actual_payment_date"].notna() & (invoices_df["actual_payment_date"] != ""),
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

    # Payment history
    payments_df.columns = payments_df.columns.str.strip()

    # ── 1. Build payment_terms lookup ─────────────────────────────────
    # Extract unique payment terms from the invoices CSV
    pt_cols = ["payment_term", "payment_term_net_days", "discount_pct", "discount_days"]
    payment_terms_df = invoices_df[pt_cols].drop_duplicates(subset=["payment_term"]).copy()
    payment_terms_df.rename(
        columns={
            "payment_term": "name",
            "payment_term_net_days": "net_days",
        },
        inplace=True,
    )
    payment_terms_df["discount_pct"] = payment_terms_df["discount_pct"].fillna(0)
    # discount_days: convert NaN to None
    payment_terms_df["discount_days"] = payment_terms_df["discount_days"].where(
        payment_terms_df["discount_days"].notna(), None
    )

    print(f"\n🔧 Extracted {len(payment_terms_df)} unique payment terms from invoices.")

    with engine.begin() as conn:
        # ── Clear existing rows (reverse FK order) ────────────────────
        print("\n🗑️  Clearing existing data …")
        conn.execute(text("DELETE FROM payment_history"))
        conn.execute(text("DELETE FROM predictions"))
        conn.execute(text("DELETE FROM customer_risk_scores"))
        conn.execute(text("DELETE FROM invoices"))
        conn.execute(text("DELETE FROM payment_terms"))
        conn.execute(text("DELETE FROM customers"))
        print("   Done.")

        # ── 2. Insert customers ───────────────────────────────────────
        print("\n⬆️  Inserting customers …")
        cust_insert = customers_df[
            [
                "id", "name", "industry", "region", "size_category",
                "credit_limit", "avg_payment_days", "late_payment_ratio",
                "created_at", "updated_at",
            ]
        ]
        cust_insert.to_sql("customers", conn, if_exists="append", index=False)
        print(f"   ✅ {len(cust_insert)} customers inserted.")

        # ── 3. Insert payment terms ───────────────────────────────────
        print("\n⬆️  Inserting payment terms …")
        # Generate UUIDs for payment terms
        import uuid as uuid_mod
        pt_id_map: dict[str, str] = {}
        pt_rows = []
        for _, row in payment_terms_df.iterrows():
            pt_id = str(uuid_mod.uuid4())
            pt_id_map[row["name"]] = pt_id
            pt_rows.append({
                "id": pt_id,
                "name": row["name"],
                "net_days": int(row["net_days"]),
                "discount_pct": float(row["discount_pct"]),
                "discount_days": int(row["discount_days"]) if pd.notna(row["discount_days"]) else None,
            })
        pt_insert_df = pd.DataFrame(pt_rows)
        pt_insert_df.to_sql("payment_terms", conn, if_exists="append", index=False)
        print(f"   ✅ {len(pt_insert_df)} payment terms inserted.")

        # ── 4. Insert invoices ────────────────────────────────────────
        print("\n⬆️  Inserting invoices …")
        # Map payment_term name → payment_term_id
        invoices_df["payment_term_id"] = invoices_df["payment_term"].map(pt_id_map)

        inv_insert = invoices_df[
            [
                "id", "invoice_number", "customer_id", "payment_term_id",
                "issue_date", "due_date", "actual_payment_date",
                "amount", "currency", "status", "category",
                "is_recurring", "notes", "created_at", "updated_at",
            ]
        ].copy()

        inv_insert.to_sql("invoices", conn, if_exists="append", index=False)
        print(f"   ✅ {len(inv_insert)} invoices inserted.")

        # ── 5. Insert payment history ─────────────────────────────────
        print("\n⬆️  Inserting payment history …")
        ph_insert = payments_df[
            ["id", "invoice_id", "payment_date", "amount_paid", "payment_method"]
        ]
        ph_insert.to_sql("payment_history", conn, if_exists="append", index=False)
        print(f"   ✅ {len(ph_insert)} payment history rows inserted.")

    # ── Summary ───────────────────────────────────────────────────────
    print("\n" + "=" * 50)
    print("✅ Data loading complete!")
    print("=" * 50)
    print(f"   Customers       : {len(cust_insert):>6}")
    print(f"   Payment Terms   : {len(pt_insert_df):>6}")
    print(f"   Invoices        : {len(inv_insert):>6}")
    print(f"   Payment History : {len(ph_insert):>6}")
    print("=" * 50)


if __name__ == "__main__":
    main()
