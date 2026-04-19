# API Integration Plan

## Current State
The frontend uses mock data from `src/lib/mock-data.ts`. All data structures match the real PostgreSQL database schema.

## Backend API (FastAPI)

Base URL: `http://localhost:8000/api/v1`

### Available Endpoints

| Method | Endpoint | Frontend Usage |
|---|---|---|
| `GET` | `/customers` | Customers page table |
| `GET` | `/customers/{id}` | Customer detail drawer |
| `POST` | `/customers` | (Future) Create customer |
| `GET` | `/invoices` | Invoice explorer table |
| `GET` | `/invoices/{id}` | Invoice detail modal |
| `POST` | `/invoices` | (Future) Create invoice |
| `POST` | `/predictions/single/{invoice_id}` | Predictions page |
| `POST` | `/predictions/batch` | Batch predictions |
| `GET` | `/predictions/history/{invoice_id}` | Prediction history |

### New Endpoints Needed

These dashboard-specific endpoints need to be added to the FastAPI backend:

| Method | Endpoint | SQL Source | Description |
|---|---|---|---|
| `GET` | `/dashboard/kpi` | `kpi_summary.sql` | KPI summary row |
| `GET` | `/dashboard/trend` | `monthly_delay_trend.sql` | Monthly trend data |
| `GET` | `/dashboard/aging` | `aging_buckets.sql` | Aging bucket summary |
| `GET` | `/dashboard/high-risk` | `high_risk_customers.sql` | High risk customer list |
| `GET` | `/dashboard/distribution` | `predicted_delay_distribution.sql` | Delay probability histogram |
| `GET` | `/dashboard/top-risk` | `top_customers_by_risk.sql` | Top 20 risky customers |

## Integration Steps

### Step 1: Add Dashboard Router to FastAPI
```python
# backend/app/api/dashboard.py
@router.get("/kpi")
async def get_kpi_summary(db: Session = Depends(get_db)):
    result = db.execute(text(KPI_QUERY)).fetchone()
    return dict(result._mapping)
```

### Step 2: Replace Mock Data in Frontend
```typescript
// Before (mock):
const kpi = mockKPI;

// After (API):
const kpi = await dashboardApi.kpiSummary();
```

### Step 3: Add React Query (Optional)
```bash
npm install @tanstack/react-query
```

Use `useQuery` hooks for caching, loading states, and error handling.

### Step 4: Environment Configuration
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Step 5: Authentication
Add JWT auth flow:
1. Login endpoint returns JWT token
2. Store in httpOnly cookie or localStorage
3. Add to API headers: `Authorization: Bearer {token}`
4. Protect dashboard routes with middleware

## Data Mapping

| Frontend Type | Backend Table | View |
|---|---|---|
| `KPISummary` | - | `delay_overview` |
| `MonthlyTrend` | - | `trend_analysis` |
| `AgingBucket` | - | `aging_buckets` |
| `Customer` | `customers` | `customer_risk` |
| `Invoice` | `invoices` | `delay_overview` |
| `PredictionResult` | `predictions` | - |
