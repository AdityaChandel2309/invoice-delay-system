"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockInvoices } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const statusOptions = ["all", "paid", "issued", "overdue", "partially_paid", "draft", "cancelled"];

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
        <h1 className="text-2xl font-bold">Invoice Explorer</h1>
        <p className="text-sm text-muted-foreground">Browse, filter, and analyze all invoices with prediction overlays.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by invoice number or customer…" className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((s) => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => { setStatusFilter(s); setPage(1); }} className="capitalize">
              {s === "all" ? "All" : s.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
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
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-zinc-900/50 transition-colors cursor-pointer" onClick={() => setSelectedInvoice(inv)}>
                    <td className="p-4">
                      <span className="text-sm font-medium font-mono">{inv.invoiceNumber}</span>
                      {inv.isRecurring && <Badge variant="secondary" className="ml-2 text-[10px]">Recurring</Badge>}
                    </td>
                    <td className="p-4 text-sm">{inv.customerName}</td>
                    <td className="p-4"><span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${getStatusColor(inv.status)}`}>{inv.status}</span></td>
                    <td className="p-4 text-right text-sm font-medium">{formatCurrency(inv.amount, inv.currency)}</td>
                    <td className="p-4 text-sm text-muted-foreground">{formatDate(inv.dueDate)}</td>
                    <td className="p-4 text-sm text-muted-foreground">{inv.category}</td>
                    <td className="p-4 text-right">
                      {inv.delayProbability !== null && (
                        <span className={`text-sm font-mono ${inv.delayProbability >= 0.7 ? "text-red-400" : inv.delayProbability >= 0.4 ? "text-yellow-400" : "text-emerald-400"}`}>
                          {(inv.delayProbability * 100).toFixed(0)}%
                        </span>
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
            <span className="text-sm text-muted-foreground">{filtered.length} invoices found</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm">Page {page} of {totalPages || 1}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedInvoice(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-border rounded-xl z-50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold font-mono">{selectedInvoice.invoiceNumber}</h2>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.customerName}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(null)}><X className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { label: "Amount", value: formatCurrency(selectedInvoice.amount, selectedInvoice.currency) },
                  { label: "Status", value: selectedInvoice.status },
                  { label: "Issue Date", value: formatDate(selectedInvoice.issueDate) },
                  { label: "Due Date", value: formatDate(selectedInvoice.dueDate) },
                  { label: "Payment Date", value: selectedInvoice.actualPaymentDate ? formatDate(selectedInvoice.actualPaymentDate) : "Pending" },
                  { label: "Category", value: selectedInvoice.category },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-zinc-900 p-3">
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="text-sm font-medium mt-0.5 capitalize">{item.value}</div>
                  </div>
                ))}
              </div>
              {selectedInvoice.delayProbability !== null && (
                <div className="rounded-lg border border-border p-4">
                  <div className="text-sm font-medium mb-2">ML Prediction</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Delay Probability</span>
                    <span className="text-lg font-bold font-mono">{(selectedInvoice.delayProbability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 mt-2">
                    <div className={`h-2 rounded-full transition-all ${selectedInvoice.delayProbability >= 0.7 ? "bg-red-500" : selectedInvoice.delayProbability >= 0.4 ? "bg-yellow-500" : "bg-emerald-500"}`} style={{ width: `${selectedInvoice.delayProbability * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
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
