import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/** Risk tier → Tailwind text color using semantic tokens */
export function getRiskColor(tier: string): string {
  switch (tier) {
    case "CRITICAL": return "text-status-danger";
    case "HIGH": return "text-status-danger";
    case "MEDIUM": return "text-status-warning";
    case "LOW": return "text-status-healthy";
    default: return "text-muted-foreground";
  }
}

/** Risk tier → Tailwind bg + border using semantic tokens */
export function getRiskBg(tier: string): string {
  switch (tier) {
    case "CRITICAL": return "bg-metric-danger-bg border-status-danger/20";
    case "HIGH": return "bg-metric-danger-bg border-status-danger/20";
    case "MEDIUM": return "bg-metric-warning-bg border-status-warning/20";
    case "LOW": return "bg-metric-healthy-bg border-status-healthy/20";
    default: return "bg-muted border-border";
  }
}

/** Invoice status → Tailwind classes using semantic tokens */
export function getStatusColor(status: string): string {
  switch (status) {
    case "paid": return "text-status-healthy";
    case "overdue": return "text-status-danger";
    case "issued": return "text-status-warning";
    case "pending": return "text-status-warning";
    case "partially_paid": return "text-status-warning";
    case "draft": return "text-muted-foreground";
    case "cancelled": return "text-muted-foreground/50";
    default: return "text-muted-foreground";
  }
}
