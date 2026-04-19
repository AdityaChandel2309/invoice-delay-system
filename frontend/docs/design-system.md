# Design System

## Color Palette

### Primary Colors
| Token | Value | Usage |
|---|---|---|
| `--primary` | `#6366f1` (Indigo 500) | Buttons, links, active states |
| `--primary-foreground` | `#ffffff` | Text on primary backgrounds |

### Semantic Colors
| Token | Value | Usage |
|---|---|---|
| `--success` | `#10b981` | Positive states, on-time payments |
| `--warning` | `#f59e0b` | Medium risk, caution states |
| `--destructive` | `#ef4444` | High risk, errors, critical |
| `--info` | `#3b82f6` | Informational elements |

### Surface Colors
| Token | Value | Usage |
|---|---|---|
| `--background` | `#09090b` | Page background |
| `--card` | `#18181b` | Card backgrounds |
| `--secondary` | `#27272a` | Secondary surfaces |
| `--muted-foreground` | `#a1a1aa` | Secondary text |
| `--border` | `#27272a` | Border color |

## Typography

- **Font Family**: Geist Sans (headings + body), Geist Mono (data values)
- **Scale**: text-xs (11px) → text-5xl (48px)
- **Weight**: Regular (400), Medium (500), Semibold (600), Bold (700)

## Spacing

Uses Tailwind's 4px-based spacing scale: `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-6` (24px)

## Border Radius

- Cards: `rounded-xl` (12px)
- Buttons: `rounded-lg` (8px)
- Badges: `rounded-md` (6px)
- Avatars: `rounded-full`

## Elevation & Effects

### Glass Effect
```css
.glass { background: rgba(24, 24, 27, 0.6); backdrop-filter: blur(12px); }
```

### Glow Effects
```css
.glow-primary { box-shadow: 0 0 20px rgba(99, 102, 241, 0.15); }
.glow-success { box-shadow: 0 0 20px rgba(16, 185, 129, 0.15); }
.glow-danger { box-shadow: 0 0 20px rgba(239, 68, 68, 0.15); }
```

### Gradient Text
```css
.gradient-text { background: linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa); }
```

## Risk Tier Color Mapping

| Tier | Text Color | Badge Variant | Background |
|---|---|---|---|
| CRITICAL | `text-red-400` | `critical` | `bg-red-500/10` |
| HIGH | `text-orange-400` | `high` | `bg-orange-500/10` |
| MEDIUM | `text-yellow-400` | `medium` | `bg-yellow-500/10` |
| LOW | `text-emerald-400` | `low` | `bg-emerald-500/10` |

## Invoice Status Colors

| Status | Style |
|---|---|
| paid | `bg-emerald-500/10 text-emerald-400` |
| overdue | `bg-red-500/10 text-red-400` |
| issued | `bg-blue-500/10 text-blue-400` |
| partially_paid | `bg-yellow-500/10 text-yellow-400` |
| draft | `bg-zinc-500/10 text-zinc-400` |
