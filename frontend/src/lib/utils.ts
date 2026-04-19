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

export function getRiskColor(tier: string): string {
  switch (tier) {
    case "CRITICAL": return "text-red-400";
    case "HIGH": return "text-orange-400";
    case "MEDIUM": return "text-yellow-400";
    case "LOW": return "text-emerald-400";
    default: return "text-zinc-400";
  }
}

export function getRiskBg(tier: string): string {
  switch (tier) {
    case "CRITICAL": return "bg-red-500/10 border-red-500/20";
    case "HIGH": return "bg-orange-500/10 border-orange-500/20";
    case "MEDIUM": return "bg-yellow-500/10 border-yellow-500/20";
    case "LOW": return "bg-emerald-500/10 border-emerald-500/20";
    default: return "bg-zinc-500/10 border-zinc-500/20";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "paid": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "overdue": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "issued": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "partially_paid": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "draft": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    case "cancelled": return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}
