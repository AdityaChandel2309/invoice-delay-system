"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockInvoices } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const statusOptions = ["all", "paid", "issued", "overdue", "partially_paid", "draft", "cancelled"];

const statusDots: Record<string, string> = {
  all: "bg-foreground/40",
  paid: "bg-emerald-400",
  issued: "bg-blue-400",
  overdue: "bg-red-400",
  partially_paid: "bg-amber-400",
  draft: "bg-zinc-400",
  cancelled: "bg-zinc-500",
};

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof mockInvoices[0] | null>(null);
  const perPage = 8;

  const filtered = mockInvoices.filter((inv) => {
    const matchSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || inv.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoice Explorer</h1>
        <p className="text-sm text-muted-foreground/60 mt-0.5">Browse, filter, and analyze all invoices with prediction overlays.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <Input placeholder="Search by invoice number or customer…" className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex gap-1.5 flex-wrap bg-white/[0.02] border border-border rounded-lg p-1">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all duration-200 ${
                statusFilter === s ? "bg-white/[0.06] text-foreground" : "text-muted-foreground/50 hover:text-foreground hover:bg-white/[0.03]"
              }`}
            >
              <div className={`h-1.5 w-1.5 rounded-full ${statusDots[s]}`} />
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-[11px] text-muted-foreground/40 uppercase tracking-wider">
                  <th className="text-left p-4 font-medium">Invoice</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Due Date</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-right p-4 font-medium">Delay Prob</th>
                  <th className="text-left p-4 font-medium">Prediction</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-white/[0.015] transition-colors cursor-pointer group" onClick={() => setSelectedInvoice(inv)}>
                    <td className="p-4">
                      <span className="text-sm font-medium font-mono">{inv.invoiceNumber}</span>
                      {inv.isRecurring && <Badge variant="secondary" className="ml-2 text-[10px]">Recurring</Badge>}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground/70">{inv.customerName}</td>
                    <td className="p-4"><span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${getStatusColor(inv.status)}`}>{inv.status}</span></td>
                    <td className="p-4 text-right text-sm font-medium tabular-nums">{formatCurrency(inv.amount, inv.currency)}</td>
                    <td className="p-4 text-sm text-muted-foreground/50 tabular-nums">{formatDate(inv.dueDate)}</td>
                    <td className="p-4 text-sm text-muted-foreground/50">{inv.category}</td>
                    <td className="p-4 text-right">
                      {inv.delayProbability !== null && (
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${inv.delayProbability >= 0.7 ? "bg-red-400" : inv.delayProbability >= 0.4 ? "bg-amber-400" : "bg-emerald-400"}`}
                              style={{ width: `${inv.delayProbability * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-mono tabular-nums ${inv.delayProbability >= 0.7 ? "text-red-400/80" : inv.delayProbability >= 0.4 ? "text-amber-400/80" : "text-emerald-400/80"}`}>
                            {(inv.delayProbability * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {inv.willBeDelayed !== null && (
                        inv.willBeDelayed ? <Badge variant="critical">Delay</Badge> : <Badge variant="success">On Time</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <span className="text-xs text-muted-foreground/40 tabular-nums">{filtered.length} invoices found</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-xs tabular-nums text-muted-foreground/60">Page {page} of {totalPages || 1}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setSelectedInvoice(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ type: "spring", damping: 25 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0a0a0c] border border-border rounded-2xl z-50 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold font-mono tracking-tight">{selectedInvoice.invoiceNumber}</h2>
                  <p className="text-sm text-muted-foreground/50">{selectedInvoice.customerName}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(null)}><X className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Amount", value: formatCurrency(selectedInvoice.amount, selectedInvoice.currency) },
                  { label: "Status", value: selectedInvoice.status },
                  { label: "Issue Date", value: formatDate(selectedInvoice.issueDate) },
                  { label: "Due Date", value: formatDate(selectedInvoice.dueDate) },
                  { label: "Payment Date", value: selectedInvoice.actualPaymentDate ? formatDate(selectedInvoice.actualPaymentDate) : "Pending" },
                  { label: "Category", value: selectedInvoice.category },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-white/[0.02] border border-border p-3">
                    <div className="text-[10px] text-muted-foreground/40">{item.label}</div>
                    <div className="text-sm font-medium mt-0.5 capitalize">{item.value}</div>
                  </div>
                ))}
              </div>
              {selectedInvoice.delayProbability !== null && (
                <div className="rounded-xl border border-border p-5">
                  <div className="text-sm font-medium mb-3">ML Prediction</div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground/50">Delay Probability</span>
                    <span className="text-xl font-bold font-mono tabular-nums">{(selectedInvoice.delayProbability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedInvoice.delayProbability * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${selectedInvoice.delayProbability >= 0.7 ? "bg-gradient-to-r from-orange-500 to-red-500" : selectedInvoice.delayProbability >= 0.4 ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-emerald-500 to-teal-500"}`}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground/40">
                    <span>Predicted Delay: {selectedInvoice.predictedDelayDays}d</span>
                    <span>{selectedInvoice.willBeDelayed ? "⚠️ Will Delay" : "✅ On Time"}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
