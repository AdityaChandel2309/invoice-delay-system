"""Generate realistic sample data for the Invoice Payment Delay Prediction System.

Produces:
  - data/sample/customers.csv   (500 customers)
  - data/sample/invoices.csv    (10,000 invoices)
  - data/sample/payment_history.csv

Run from the project root:
    python data/generate_sample_data.py
"""

from __future__ import annotations

import csv
import os
import random
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path

# ── Configuration ─────────────────────────────────────────────────────
NUM_CUSTOMERS = 500
NUM_INVOICES = 10_000
SEED = 42

random.seed(SEED)

OUTPUT_DIR = Path(__file__).resolve().parent / "sample"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Reference data ────────────────────────────────────────────────────

INDUSTRIES = [
    ("Technology", 0.15),
    ("Healthcare", 0.12),
    ("Finance", 0.10),
    ("Manufacturing", 0.12),
    ("Retail", 0.10),
    ("Construction", 0.08),
    ("Transportation", 0.06),
    ("Energy", 0.05),
    ("Education", 0.05),
    ("Media & Entertainment", 0.04),
    ("Hospitality", 0.04),
    ("Agriculture", 0.03),
    ("Real Estate", 0.03),
    ("Telecommunications", 0.03),
]

REGIONS = [
    ("North America", 0.30),
    ("Europe", 0.25),
    ("Asia Pacific", 0.20),
    ("Latin America", 0.10),
    ("Middle East", 0.08),
    ("Africa", 0.07),
]

SIZE_CATEGORIES = ["Small", "Medium", "Large", "Enterprise"]
SIZE_WEIGHTS = [0.35, 0.30, 0.20, 0.15]

CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "INR"]
CURRENCY_WEIGHTS = [0.40, 0.20, 0.10, 0.08, 0.07, 0.07, 0.08]

INVOICE_CATEGORIES = [
    "Professional Services", "Software License", "Hardware",
    "Consulting", "Maintenance", "Subscription", "Training",
    "Materials", "Shipping", "Custom Development",
]

# Payment terms: (name, net_days, discount_pct, discount_days)
PAYMENT_TERMS = [
    ("Net 15", 15, 0, None),
    ("Net 30", 30, 0, None),
    ("Net 45", 45, 0, None),
    ("Net 60", 60, 0, None),
    ("Net 90", 90, 0, None),
    ("2/10 Net 30", 30, 2.0, 10),
    ("1/10 Net 45", 45, 1.0, 10),
]
TERM_WEIGHTS = [0.10, 0.35, 0.15, 0.15, 0.05, 0.12, 0.08]

# Industry-specific delay tendencies (higher = more likely to be late)
INDUSTRY_DELAY_BIAS: dict[str, float] = {
    "Technology": 0.15,
    "Healthcare": 0.25,
    "Finance": 0.10,
    "Manufacturing": 0.30,
    "Retail": 0.35,
    "Construction": 0.45,
    "Transportation": 0.30,
    "Energy": 0.20,
    "Education": 0.20,
    "Media & Entertainment": 0.25,
    "Hospitality": 0.40,
    "Agriculture": 0.35,
    "Real Estate": 0.30,
    "Telecommunications": 0.15,
}

# Company name parts for realistic names
PREFIXES = [
    "Advanced", "Alpha", "Apex", "Atlas", "Blue", "Bright", "Core",
    "Crown", "Delta", "Eagle", "Elite", "Falcon", "Global", "Golden",
    "Grand", "Green", "Horizon", "Icon", "Infinity", "Iron", "Jade",
    "Key", "Luna", "Metro", "Nova", "Omega", "Pacific", "Peak",
    "Phoenix", "Pinnacle", "Prism", "Prime", "Quantum", "Red",
    "Royal", "Silver", "Solar", "Spark", "Star", "Summit", "Titan",
    "Unity", "Vertex", "Vista", "Zenith",
]
SUFFIXES = [
    "Corp", "Inc", "LLC", "Group", "Holdings", "Solutions", "Systems",
    "Technologies", "Industries", "Enterprises", "Partners", "Networks",
    "Dynamics", "Labs", "Works", "Services", "Consulting", "Ventures",
    "International", "Global",
]


def weighted_choice(items: list[tuple[str, float]]) -> str:
    """Pick from a list of (value, weight) tuples."""
    values, weights = zip(*items)
    return random.choices(values, weights=weights, k=1)[0]


def generate_company_name(used: set[str]) -> str:
    """Generate a unique company name."""
    for _ in range(1000):
        name = f"{random.choice(PREFIXES)} {random.choice(SUFFIXES)}"
        if name not in used:
            used.add(name)
            return name
    # Fallback — add a number
    name = f"{random.choice(PREFIXES)} {random.choice(SUFFIXES)} {random.randint(1, 999)}"
    used.add(name)
    return name


# ── Generate customers ────────────────────────────────────────────────

def generate_customers() -> list[dict]:
    print(f"Generating {NUM_CUSTOMERS} customers…")
    customers = []
    used_names: set[str] = set()

    for _ in range(NUM_CUSTOMERS):
        industry = weighted_choice(INDUSTRIES)
        region = weighted_choice(REGIONS)
        size = random.choices(SIZE_CATEGORIES, weights=SIZE_WEIGHTS, k=1)[0]

        # Credit limit correlates with size
        credit_base = {
            "Small": (5_000, 50_000),
            "Medium": (25_000, 250_000),
            "Large": (100_000, 1_000_000),
            "Enterprise": (500_000, 10_000_000),
        }[size]
        credit_limit = round(random.uniform(*credit_base), 2)

        # Customer "personality" — how reliable they are
        # This creates a bimodal-ish distribution: mostly reliable + some risky
        reliability = random.betavariate(2.5, 1.5)  # skewed towards reliable
        industry_bias = INDUSTRY_DELAY_BIAS.get(industry, 0.25)

        # Late payment ratio influenced by reliability + industry
        late_ratio = max(0.0, min(1.0,
            (1 - reliability) * 0.6 + industry_bias * 0.4 + random.gauss(0, 0.05)
        ))
        late_ratio = round(late_ratio, 4)

        # Avg payment days: reliable customers ~20-30, unreliable ~40-80
        avg_days = round(
            20 + (1 - reliability) * 50 + random.gauss(0, 5), 2
        )
        avg_days = max(5.0, avg_days)

        # Customer created between 1-7 years ago
        days_ago = random.randint(365, 365 * 7)
        created_at = datetime.now() - timedelta(days=days_ago)

        customers.append({
            "id": str(uuid.uuid4()),
            "name": generate_company_name(used_names),
            "industry": industry,
            "region": region,
            "size_category": size,
            "credit_limit": credit_limit,
            "avg_payment_days": avg_days,
            "late_payment_ratio": late_ratio,
            "created_at": created_at.isoformat(),
            "updated_at": created_at.isoformat(),
            # Internal fields for invoice generation (not saved to CSV)
            "_reliability": reliability,
            "_industry_bias": industry_bias,
        })

    return customers


# ── Generate invoices ─────────────────────────────────────────────────

def generate_invoices(customers: list[dict]) -> tuple[list[dict], list[dict]]:
    print(f"Generating {NUM_INVOICES} invoices…")
    invoices = []
    payments = []
    inv_num = 1000

    # Distribute invoices across customers (power-law-ish)
    # Some customers have many invoices, most have few
    customer_weights = [
        max(0.1, random.paretovariate(1.5)) for _ in customers
    ]
    total_w = sum(customer_weights)
    customer_weights = [w / total_w for w in customer_weights]

    for _ in range(NUM_INVOICES):
        cust = random.choices(customers, weights=customer_weights, k=1)[0]
        inv_num += 1

        # Payment term
        term_idx = random.choices(range(len(PAYMENT_TERMS)), weights=TERM_WEIGHTS, k=1)[0]
        term_name, net_days, disc_pct, disc_days = PAYMENT_TERMS[term_idx]

        # Issue date: spread over last 3 years
        issue_offset = random.randint(30, 365 * 3)
        issue_date = date.today() - timedelta(days=issue_offset)
        due_date = issue_date + timedelta(days=net_days)

        # Invoice amount — influenced by customer size + some randomness
        size = cust["size_category"]
        amount_range = {
            "Small": (100, 15_000),
            "Medium": (500, 50_000),
            "Large": (2_000, 200_000),
            "Enterprise": (10_000, 500_000),
        }[size]
        # Log-normal-ish distribution (many small, few large)
        amount = round(
            random.lognormvariate(
                (amount_range[0] + amount_range[1]) / 2 * 0.001,
                0.8,
            ) * amount_range[0] * 2,
            2,
        )
        amount = max(amount_range[0], min(amount_range[1], amount))

        currency = random.choices(CURRENCIES, weights=CURRENCY_WEIGHTS, k=1)[0]
        category = random.choice(INVOICE_CATEGORIES)
        is_recurring = random.random() < 0.25  # 25% recurring

        # ── Determine payment behavior ────────────────────────────────
        reliability = cust["_reliability"]
        industry_bias = cust["_industry_bias"]

        # Base delay probability from customer profile
        delay_prob = (
            (1 - reliability) * 0.45
            + industry_bias * 0.25
            + (amount / cust["credit_limit"]) * 0.15  # high utilisation → riskier
            + (0.05 if is_recurring else 0.0)  # recurring slightly less risky (negative)
        )

        # Seasonal effect (Q4 and Q1 have more delays)
        month = issue_date.month
        if month in (12, 1, 2):
            delay_prob += 0.08
        elif month in (6, 7):
            delay_prob -= 0.05

        # Month-end invoices slightly more delayed
        if issue_date.day >= 28:
            delay_prob += 0.04

        # Longer payment terms → less delay (more time to pay)
        if net_days >= 60:
            delay_prob -= 0.06
        elif net_days <= 15:
            delay_prob += 0.08

        delay_prob = max(0.02, min(0.95, delay_prob))

        is_delayed = random.random() < delay_prob

        # Determine actual payment date
        if is_delayed:
            # Delay days: exponential-ish, capped
            delay_days = max(1, int(random.expovariate(1 / 15)))  # mean ~15 days
            delay_days = min(delay_days, 120)  # cap at 120 days late

            # Higher amounts tend to be later
            if amount > 50_000:
                delay_days = int(delay_days * random.uniform(1.0, 1.5))

            actual_payment = due_date + timedelta(days=delay_days)
        else:
            # On-time: pay 0–N days before due date (some pay exactly on time)
            early_days = random.choices(
                [0, 1, 2, 3, 5, 7, 10, 14],
                weights=[0.20, 0.15, 0.10, 0.10, 0.15, 0.10, 0.10, 0.10],
                k=1,
            )[0]
            actual_payment = due_date - timedelta(days=early_days)
            # Ensure payment is after issue
            if actual_payment < issue_date:
                actual_payment = issue_date + timedelta(days=max(1, net_days // 2))

        # Some very recent invoices are still unpaid
        if actual_payment > date.today():
            actual_payment_str = None
            if due_date < date.today():
                status = "overdue"
            else:
                status = random.choice(["issued", "issued", "draft"])
        else:
            actual_payment_str = actual_payment.isoformat()
            if is_delayed:
                status = "paid"
            else:
                status = "paid"

        # A small fraction are cancelled
        if random.random() < 0.02:
            status = "cancelled"
            actual_payment_str = None

        invoice_id = str(uuid.uuid4())

        invoices.append({
            "id": invoice_id,
            "invoice_number": f"INV-{inv_num:06d}",
            "customer_id": cust["id"],
            "payment_term": term_name,
            "payment_term_net_days": net_days,
            "discount_pct": disc_pct,
            "discount_days": disc_days if disc_days else "",
            "issue_date": issue_date.isoformat(),
            "due_date": due_date.isoformat(),
            "actual_payment_date": actual_payment_str if actual_payment_str else "",
            "amount": amount,
            "currency": currency,
            "status": status,
            "category": category,
            "is_recurring": is_recurring,
            "notes": "",
            "created_at": datetime.combine(issue_date, datetime.min.time()).isoformat(),
            "updated_at": datetime.combine(
                actual_payment if actual_payment_str else issue_date,
                datetime.min.time(),
            ).isoformat(),
        })

        # ── Payment history ───────────────────────────────────────────
        if actual_payment_str and status == "paid":
            # Most invoices paid in one lump sum; ~10% have partial payments
            if random.random() < 0.10 and amount > 1000:
                # Split into 2 payments
                first_pct = random.uniform(0.3, 0.7)
                first_amount = round(amount * first_pct, 2)
                second_amount = round(amount - first_amount, 2)

                first_date = actual_payment - timedelta(
                    days=random.randint(3, 15)
                )
                if first_date < issue_date:
                    first_date = issue_date + timedelta(days=1)

                payments.append({
                    "id": str(uuid.uuid4()),
                    "invoice_id": invoice_id,
                    "payment_date": first_date.isoformat(),
                    "amount_paid": first_amount,
                    "payment_method": random.choice([
                        "bank_transfer", "credit_card", "check", "ach",
                    ]),
                })
                payments.append({
                    "id": str(uuid.uuid4()),
                    "invoice_id": invoice_id,
                    "payment_date": actual_payment.isoformat(),
                    "amount_paid": second_amount,
                    "payment_method": random.choice([
                        "bank_transfer", "credit_card", "check", "ach",
                    ]),
                })
            else:
                payments.append({
                    "id": str(uuid.uuid4()),
                    "invoice_id": invoice_id,
                    "payment_date": actual_payment.isoformat(),
                    "amount_paid": amount,
                    "payment_method": random.choice([
                        "bank_transfer", "credit_card", "check", "ach",
                        "wire", "bank_transfer", "ach",
                    ]),
                })

    return invoices, payments


# ── Write CSVs ────────────────────────────────────────────────────────

def write_csv(path: Path, rows: list[dict], exclude_keys: set[str] | None = None):
    if not rows:
        return
    exclude = exclude_keys or set()
    fieldnames = [k for k in rows[0] if k not in exclude]
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    print(f"  ✓ {path.name}: {len(rows):,} rows")


def main():
    print("=" * 60)
    print("Invoice Payment Delay — Sample Data Generator")
    print("=" * 60)

    customers = generate_customers()
    invoices, payments = generate_invoices(customers)

    # ── Summary stats ─────────────────────────────────────────────────
    paid_invoices = [i for i in invoices if i["actual_payment_date"]]
    delayed = [
        i for i in paid_invoices
        if i["actual_payment_date"] > i["due_date"]
    ]

    print(f"\nSummary:")
    print(f"  Customers       : {len(customers):,}")
    print(f"  Invoices        : {len(invoices):,}")
    print(f"  Paid invoices   : {len(paid_invoices):,}")
    print(f"  Delayed (paid)  : {len(delayed):,} ({len(delayed)/max(len(paid_invoices),1):.1%})")
    print(f"  Payment records : {len(payments):,}")

    # Industry breakdown
    from collections import Counter
    ind_counts = Counter(c["industry"] for c in customers)
    print(f"\n  Industries: {dict(ind_counts.most_common(5))} …")

    # Status breakdown
    status_counts = Counter(i["status"] for i in invoices)
    print(f"  Statuses  : {dict(status_counts)}")

    # ── Write files ───────────────────────────────────────────────────
    print(f"\nWriting CSVs to {OUTPUT_DIR}/")
    internal_keys = {"_reliability", "_industry_bias"}
    write_csv(OUTPUT_DIR / "customers.csv", customers, exclude_keys=internal_keys)
    write_csv(OUTPUT_DIR / "invoices.csv", invoices)
    write_csv(OUTPUT_DIR / "payment_history.csv", payments)

    print(f"\n{'=' * 60}")
    print("Done! Files ready in data/sample/")
    print("=" * 60)


if __name__ == "__main__":
    main()
