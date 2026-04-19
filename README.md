# Invoice Payment Delay Prediction System

> AI-powered system that predicts which invoices will be paid late and by how many days — before the delay happens.

[![Python](https://img.shields.io/badge/python-3.11+-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0+-orange)](https://xgboost.readthedocs.io)

---

## Overview

| Capability | Description |
|---|---|
| **Classification** | Will this invoice be paid late? (yes / no) |
| **Regression** | If late, how many days late? |
| **Risk Scoring** | Customer-level risk tiers (LOW → CRITICAL) |
| **Dashboard** | Real-time KPIs, trends, aging analysis |
| **API** | RESTful endpoints for predictions, CRUD, analytics |

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, Tailwind CSS v4, shadcn/ui, Recharts, Framer Motion |
| **Backend API** | Python 3.11+, FastAPI, SQLAlchemy 2, Pydantic v2 |
| **Database** | PostgreSQL 16 |
| **ML Models** | XGBoost (classifier + regressor), scikit-learn |
| **Infrastructure** | Docker Compose |

## Project Structure

```
invoice-delay-system/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/                # Route handlers (invoices, customers, predictions, analytics, models)
│   │   ├── ml/                 # ML inference engine (feature_engineering, predictor, model_loader)
│   │   ├── models/             # SQLAlchemy ORM models
│   │   └── schemas/            # Pydantic request/response schemas
│   ├── tests/                  # Unit tests
│   ├── train_model.py          # XGBoost training script
│   ├── populate_all.py         # End-to-end data pipeline
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # Next.js 15 SaaS frontend
│   ├── src/app/                # App Router pages (dashboard, auth, landing)
│   ├── src/components/         # Reusable UI components
│   ├── src/lib/                # Mock data, API service, utilities
│   └── docs/                   # Design system & architecture docs
├── data/
│   ├── sample/                 # CSV sample data (customers, invoices, payment_history)
│   └── generate_sample_data.py # Synthetic data generator
├── sql/
│   ├── 001_create_tables.sql   # Schema (7 tables)
│   ├── 002_seed_data.sql       # Reference data
│   ├── 003_create_views.sql    # 5 analytics views
│   └── 004_create_indexes.sql  # Performance indexes
├── ml_models/                  # Serialized XGBoost models (.joblib)
│   ├── classifier/model.joblib
│   └── regressor/model.joblib
├── dashboard/sql/              # Dashboard SQL queries (6 queries)
├── notebooks/                  # EDA & training notebooks
├── docs/                       # Architecture, roadmap, tasks
├── docker-compose.yml
└── .env.example
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local dev)
- Node.js 20+ (for frontend)

### 1. Clone & Configure

```bash
git clone <repo-url>
cd invoice-delay-system
cp .env.example .env
```

### 2. Start Database

```bash
docker compose up -d db
```

### 3. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Generate sample data (if not already present)
cd .. && python data/generate_sample_data.py && cd backend

# Train ML models
python train_model.py

# Populate database (tables, data, predictions, views)
python populate_all.py

# Start the API
uvicorn app.main:app --reload --port 8000
```

The API docs are at http://localhost:8000/docs

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend is at http://localhost:3000

### 5. Docker (full stack)

```bash
docker compose up --build
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| **Invoices** | | |
| `POST` | `/api/v1/invoices` | Create invoice |
| `GET` | `/api/v1/invoices` | List invoices (paginated, filterable) |
| `GET` | `/api/v1/invoices/{id}` | Get invoice detail |
| `PUT` | `/api/v1/invoices/{id}` | Update invoice |
| `DELETE` | `/api/v1/invoices/{id}` | Delete invoice |
| **Customers** | | |
| `POST` | `/api/v1/customers` | Create customer |
| `GET` | `/api/v1/customers` | List customers |
| `GET` | `/api/v1/customers/{id}` | Get customer detail |
| `PUT` | `/api/v1/customers/{id}` | Update customer |
| `DELETE` | `/api/v1/customers/{id}` | Delete customer |
| **Predictions** | | |
| `POST` | `/api/v1/predictions/single` | Single invoice prediction |
| `POST` | `/api/v1/predictions/batch` | Batch predictions |
| `GET` | `/api/v1/predictions/{invoice_id}` | Get prediction |
| `GET` | `/api/v1/predictions/history/` | Prediction audit trail |
| **Analytics** | | |
| `GET` | `/api/v1/analytics/delay-overview` | Aggregate delay stats |
| `GET` | `/api/v1/analytics/delay-trend` | Monthly delay trend |
| `GET` | `/api/v1/analytics/customer-risk` | Customer risk distribution |
| `GET` | `/api/v1/analytics/model-performance` | Model accuracy metrics |
| `GET` | `/api/v1/analytics/aging-buckets` | AR aging analysis |
| **Models** | | |
| `POST` | `/api/v1/models/register` | Register trained model |
| `GET` | `/api/v1/models` | List models |
| `PUT` | `/api/v1/models/{id}/activate` | Activate model |
| `GET` | `/api/v1/models/{id}/metrics` | View model metrics |

## ML Models

| Model | Task | Primary Metric |
|---|---|---|
| **XGBoost Classifier** | Will the invoice be delayed? | F1-Score, ROC-AUC |
| **XGBoost Regressor** | How many days late? | MAE, RMSE, R² |

### Features Used

- **Invoice**: amount, days_until_due, invoice_age, payment_term_net_days, is_recurring
- **Customer**: avg_payment_days, late_payment_ratio, credit_limit, tenure
- **Derived**: amount_to_credit_ratio, month/quarter/weekday issued, month-end/quarter-end flags

## Database Views

| View | Description |
|---|---|
| `delay_overview` | Invoice + prediction join for comprehensive analysis |
| `customer_risk` | Customer profiles with risk scores and invoice summaries |
| `trend_analysis` | Monthly aggregated delay trends |
| `aging_buckets` | AR aging buckets by days past due |
| `model_performance` | Model prediction accuracy tracking |

## License

MIT
