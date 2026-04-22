"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { mockInvoices } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const statusOptions = ["all", "paid", "issued", "overdue", "partially_paid", "draft", "cancelled"];

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<typeof mockInvoices[0] | null>(null);
  const perPage = 8;

  const filtered = mockInvoices.filter((inv) => {
    const ms = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || inv.customerName.toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter === "all" || inv.status === statusFilter;
    return ms && mst;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <PageTransition routeKey="invoices">
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Invoice Explorer</h1>
          <p className="text-sm text-muted-foreground">Browse, filter, and analyze invoices with prediction overlays.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by invoice or customer…" className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((s) => (
              <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => { setStatusFilter(s); setPage(1); }} className="capitalize">
                {s === "all" ? "All" : s.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Invoice", "Customer", "Status", "Amount", "Due Date", "Category", "Delay Prob", "Prediction"].map((h) => (
                      <th key={h} className={`p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${h === "Amount" || h === "Delay Prob" ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((inv) => (
                    <tr key={inv.id} className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelected(inv)}>
                      <td className="p-4">
                        <span className="font-mono text-sm font-medium text-foreground">{inv.invoiceNumber}</span>
                        {inv.isRecurring && <Badge variant="secondary" className="ml-2 text-[10px]">Recurring</Badge>}
                      </td>
                      <td className="p-4 text-sm text-foreground">{inv.customerName}</td>
                      <td className="p-4"><StatusBadge status={inv.status} /></td>
                      <td className="p-4 text-right font-mono text-sm font-medium text-foreground">{formatCurrency(inv.amount, inv.currency)}</td>
                      <td className="p-4 font-mono text-sm text-muted-foreground">{formatDate(inv.dueDate)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{inv.category}</td>
                      <td className="p-4 text-right">
                        {inv.delayProbability !== null && (
                          <span className={`font-mono text-sm ${inv.delayProbability >= 0.7 ? "text-status-danger" : inv.delayProbability >= 0.4 ? "text-status-warning" : "text-status-healthy"}`}>
                            {(inv.delayProbability * 100).toFixed(0)}%
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {inv.willBeDelayed !== null && (inv.willBeDelayed ? <Badge variant="critical">Delay</Badge> : <Badge variant="success">On Time</Badge>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between p-4 border-t border-border">
              <span className="text-sm text-muted-foreground font-mono">{filtered.length} invoices</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="font-mono text-sm">Page {page} of {totalPages || 1}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Detail Modal */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 z-50" onClick={() => setSelected(null)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border rounded-lg z-50 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-mono text-lg font-bold text-foreground">{selected.invoiceNumber}</h2>
                    <p className="text-sm text-muted-foreground">{selected.customerName}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelected(null)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { label: "Amount", value: formatCurrency(selected.amount, selected.currency) },
                    { label: "Status", value: selected.status },
                    { label: "Issue Date", value: formatDate(selected.issueDate) },
                    { label: "Due Date", value: formatDate(selected.dueDate) },
                    { label: "Payment Date", value: selected.actualPaymentDate ? formatDate(selected.actualPaymentDate) : "Pending" },
                    { label: "Category", value: selected.category },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-muted p-3">
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      <div className="font-mono text-sm font-medium mt-0.5 text-foreground capitalize">{item.value}</div>
                    </div>
                  ))}
                </div>
                {selected.delayProbability !== null && (
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-sm font-medium mb-2 text-foreground">ML Prediction</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Delay Probability</span>
                      <span className="font-mono text-lg font-bold text-foreground">{(selected.delayProbability * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted mt-2">
                      <div className={`h-2 rounded-full transition-all ${selected.delayProbability >= 0.7 ? "bg-status-danger" : selected.delayProbability >= 0.4 ? "bg-status-warning" : "bg-status-healthy"}`} style={{ width: `${selected.delayProbability * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span className="font-mono">Predicted Delay: {selected.predictedDelayDays}d</span>
                      <span>{selected.willBeDelayed ? "⚠️ Will Delay" : "✅ On Time"}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
