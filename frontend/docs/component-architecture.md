# Component Architecture

## Layer Structure

```
Pages (app/*)
  └── Composed from UI Components
       ├── Layout Components (sidebar, navbar)
       ├── UI Primitives (button, card, badge, input, skeleton)
       └── Data from lib/mock-data.ts (later: lib/api.ts)
```

## UI Primitives (`components/ui/`)

| Component | Based On | Variants |
|---|---|---|
| `Button` | Radix Slot + CVA | default, destructive, outline, secondary, ghost, link × sm, default, lg, icon |
| `Card` | Native div | Card, CardHeader, CardTitle, CardDescription, CardContent |
| `Badge` | CVA | default, secondary, destructive, outline, success, warning, critical, high, medium, low |
| `Input` | Native input | Standard with focus ring |
| `Skeleton` | Native div | Animated pulse placeholder |

## Layout Components (`components/layout/`)

### Sidebar
- Fixed left, 256px wide, full height
- Logo + product name
- Navigation groups (Main, Account)
- Active state with indigo indicator dot
- Usage meter card at bottom

### Navbar
- Sticky top, backdrop blur
- Search bar with ⌘K shortcut hint
- Notification bell with pulse indicator
- User avatar dropdown

## Page Components

### Dashboard (`/dashboard`)
- 6 KPI cards with trend indicators
- Area chart (monthly delay trend)
- Horizontal bar chart (aging buckets)
- High risk customers list
- Recent predictions list

### Customers (`/dashboard/customers`)
- 4 tier filter cards (CRITICAL, HIGH, MEDIUM, LOW)
- Searchable customer table
- Slide-out detail drawer (AnimatePresence)

### Invoices (`/dashboard/invoices`)
- Status filter buttons
- Search by invoice number/customer
- Paginated table with status chips
- Click-to-open detail modal

### Predictions (`/dashboard/predictions`)
- 6-field input form
- Heuristic-based prediction (simulates ML model)
- Animated result card with gauge bar
- SHAP-style factor importance bars

### Settings (`/dashboard/settings`)
- Profile section with avatar
- Notification toggle switches
- Theme selector (Dark/Light/System)
- Password change form

### Billing (`/dashboard/billing`)
- Current plan summary card
- Usage progress bars
- 3-tier pricing comparison

## Animation Strategy

- **Page mount**: `fadeUp` (opacity + y-translate, staggered)
- **Modals/drawers**: `AnimatePresence` with spring physics
- **Charts**: Recharts built-in animations
- **Gauge bars**: `motion.div` with width animation
- **Loading**: Skeleton pulse + spinner
