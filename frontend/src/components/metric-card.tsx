import { TrendingUp, TrendingDown } from "lucide-react";

type AccentColor = "healthy" | "warning" | "danger" | "neutral";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: { direction: "up" | "down"; percentage: number } | null;
  accentColor?: AccentColor;
  icon?: React.ComponentType<{ className?: string }>;
}

const ACCENT_BAR: Record<AccentColor, string> = {
  healthy: "bg-status-healthy",
  warning: "bg-status-warning",
  danger: "bg-status-danger",
  neutral: "bg-primary",
};
const ACCENT_BG: Record<AccentColor, string> = {
  healthy: "bg-metric-healthy-bg/50",
  warning: "bg-metric-warning-bg/50",
  danger: "bg-metric-danger-bg/50",
  neutral: "bg-metric-neutral-bg/50",
};
const ICON_COLOR: Record<AccentColor, string> = {
  healthy: "text-status-healthy",
  warning: "text-status-warning",
  danger: "text-status-danger",
  neutral: "text-primary",
};

export function MetricCard({ label, value, trend, accentColor = "neutral", icon: Icon }: MetricCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${ACCENT_BG[accentColor]} px-6 py-5`}>
      <div className={`absolute left-2 top-2 bottom-2 w-[3px] rounded-full ${ACCENT_BAR[accentColor]}`} />
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && <Icon className={`h-5 w-5 ${ICON_COLOR[accentColor]} opacity-60`} />}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold leading-tight text-foreground">{value}</span>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trend.direction === "up" ? "text-status-healthy" : "text-status-danger"}`}>
            {trend.direction === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.percentage}%
          </span>
        )}
      </div>
    </div>
  );
}
