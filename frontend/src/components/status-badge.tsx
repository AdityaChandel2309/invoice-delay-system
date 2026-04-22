import { cn } from "@/lib/utils";

type InvoiceStatus = "paid" | "pending" | "overdue" | "issued" | "draft" | "cancelled" | "partially_paid";

const config: Record<string, { label: string; dotClass: string; textClass: string }> = {
  paid:           { label: "Paid",           dotClass: "bg-status-healthy",              textClass: "text-status-healthy" },
  pending:        { label: "Pending",        dotClass: "bg-status-warning",              textClass: "text-status-warning" },
  issued:         { label: "Issued",         dotClass: "bg-status-warning",              textClass: "text-status-warning" },
  overdue:        { label: "Overdue",        dotClass: "bg-status-danger animate-pulse", textClass: "text-status-danger" },
  partially_paid: { label: "Partial",        dotClass: "bg-status-warning",              textClass: "text-status-warning" },
  draft:          { label: "Draft",          dotClass: "bg-muted-foreground",            textClass: "text-muted-foreground" },
  cancelled:      { label: "Cancelled",      dotClass: "bg-muted-foreground/50",         textClass: "text-muted-foreground/50" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const { label, dotClass, textClass } = config[status] || config.draft;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <span className={cn("h-2 w-2 shrink-0 rounded-full", dotClass)} />
      <span className={textClass}>{label}</span>
    </span>
  );
}
