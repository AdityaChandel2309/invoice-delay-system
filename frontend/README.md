# DelayIQ Frontend

A premium SaaS frontend for the Invoice Payment Delay Prediction System, built with Next.js 15, TypeScript, Tailwind CSS, and modern UI libraries.

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 15** | App Router, SSR, file-based routing |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Accessible component primitives |
| **Recharts** | Data visualization (charts) |
| **Framer Motion** | Animations and transitions |
| **Lucide React** | Icon library |

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
frontend/src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── login/             # Auth: Login
│   ├── signup/            # Auth: Signup
│   ├── forgot-password/   # Auth: Password reset
│   └── dashboard/         # Protected app pages
│       ├── layout.tsx     # Dashboard shell (sidebar + navbar)
│       ├── page.tsx       # Main dashboard
│       ├── customers/     # Customer risk page
│       ├── invoices/      # Invoice explorer
│       ├── predictions/   # ML prediction page
│       ├── settings/      # Account settings
│       └── billing/       # Plans & billing
├── components/
│   ├── ui/                # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   └── skeleton.tsx
│   └── layout/            # Layout components
│       ├── sidebar.tsx
│       └── navbar.tsx
├── lib/
│   ├── utils.ts           # Utility functions
│   ├── mock-data.ts       # Mock data matching DB schema
│   └── api.ts             # API service layer (FastAPI)
└── docs/
    ├── design-system.md
    ├── component-architecture.md
    └── api-integration-plan.md
```

## Pages

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Marketing page with hero, features, pricing |
| Login | `/login` | Email/password authentication |
| Signup | `/signup` | New account registration |
| Forgot Password | `/forgot-password` | Password reset flow |
| Dashboard | `/dashboard` | KPIs, charts, risk tables |
| Customers | `/dashboard/customers` | Customer risk analysis |
| Invoices | `/dashboard/invoices` | Invoice explorer with filters |
| Predictions | `/dashboard/predictions` | ML prediction form |
| Settings | `/dashboard/settings` | Account & preferences |
| Billing | `/dashboard/billing` | Subscription management |

## Connecting to Backend

Set the API URL in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

All API calls are in `src/lib/api.ts` and can be swapped from mock data to live endpoints.
