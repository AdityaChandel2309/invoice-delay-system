#!/usr/bin/env python3
"""Validate all tables, views, and dashboard queries. Output to stdout."""

import os, sys
from pathlib import Path
from sqlalchemy import create_engine, text

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/invoice_delay",
)
url = DATABASE_URL
if "psycopg2" not in url and "asyncpg" not in url:
    url = url.replace("postgresql://", "postgresql+psycopg2://")

engine = create_engine(url, echo=False)
DASHBOARD_SQL_DIR = Path(__file__).resolve().parent.parent / "dashboard" / "sql"

# ── 1. Table row counts ──────────────────────────────────────────────
print("=" * 60)
print("TABLE ROW COUNTS")
print("=" * 60)
tables = [
    "customers", "payment_terms", "invoices", "payment_history",
    "ml_model_registry", "predictions", "customer_risk_scores",
]
with engine.connect() as conn:
    for tbl in tables:
        cnt = conn.execute(text(f"SELECT COUNT(*) FROM {tbl}")).scalar()
        s = "OK" if cnt > 0 else "EMPTY"
        print(f"  [{s:>5}] {tbl:<25} : {cnt}")

# ── 2. View row counts ───────────────────────────────────────────────
print("\n" + "=" * 60)
print("VIEW ROW COUNTS")
print("=" * 60)
views = ["delay_overview", "customer_risk", "trend_analysis", "aging_buckets", "model_performance"]
with engine.connect() as conn:
    for v in views:
        try:
            cnt = conn.execute(text(f"SELECT COUNT(*) FROM {v}")).scalar()
            s = "OK" if cnt > 0 else "EMPTY"
            print(f"  [{s:>5}] {v:<25} : {cnt}")
        except Exception as e:
            print(f"  [ERROR] {v:<25} : {str(e)[:80]}")

# ── 3. Dashboard SQL queries ─────────────────────────────────────────
print("\n" + "=" * 60)
print("DASHBOARD SQL QUERY RESULTS")
print("=" * 60)
with engine.connect() as conn:
    for sql_file in sorted(DASHBOARD_SQL_DIR.glob("*.sql")):
        print(f"\n--- {sql_file.name} ---")
        raw = sql_file.read_text()
        # Extract just the first SELECT statement (ignore block comments)
        # Remove block comments /* ... */
        import re
        cleaned = re.sub(r'/\*.*?\*/', '', raw, flags=re.DOTALL)
        # Split on semicolons, take first non-trivial statement
        stmts = [s.strip() for s in cleaned.split(";") if s.strip()]
        for stmt in stmts:
            # Remove comment-only lines
            lines = [l for l in stmt.split("\n") if not l.strip().startswith("--")]
            query = "\n".join(lines).strip()
            if not query or "SELECT" not in query.upper():
                continue
            try:
                result = conn.execute(text(query))
                rows = result.fetchall()
                cols = list(result.keys())
                s = "OK" if rows else "EMPTY"
                print(f"  [{s:>5}] {len(rows)} rows returned")
                # Print column names
                print(f"  Columns: {', '.join(cols[:8])}{'...' if len(cols) > 8 else ''}")
                # Print first 3 rows
                for i, row in enumerate(rows[:3]):
                    vals = [f"{c}={row[j]}" for j, c in enumerate(cols[:6])]
                    print(f"    Row {i+1}: {', '.join(vals)}")
                if len(rows) > 3:
                    print(f"    ... and {len(rows)-3} more rows")
            except Exception as e:
                print(f"  [ERROR] {str(e)[:120]}")
            break  # Only run first query per file

print("\n" + "=" * 60)
print("VALIDATION COMPLETE")
print("=" * 60)
