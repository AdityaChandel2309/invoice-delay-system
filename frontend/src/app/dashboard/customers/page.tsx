"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { mockCustomers } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Search, X } from "lucide-react";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomers[0] | null>(null);

  const filtered = mockCustomers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase());
    const matchTier = !selectedTier || c.riskTier === selectedTier;
    return matchSearch && matchTier;
  });

  const tiers = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const tierVariant = (t: string) => t === "CRITICAL" ? "critical" : t === "HIGH" ? "high" : t === "MEDIUM" ? "medium" : "low";
  const tierCounts = tiers.map((t) => ({ tier: t, count: mockCustomers.filter((c) => c.riskTier === t).length }));

  return (
    <PageTransition routeKey="customers">
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Customer Risk</h1>
          <p className="text-sm text-muted-foreground">Monitor customer risk scores and payment behavior.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {tierCounts.map((t) => (
            <button key={t.tier} onClick={() => setSelectedTier(selectedTier === t.tier ? null : t.tier)}
              className={`rounded-lg border p-4 text-left transition-all ${selectedTier === t.tier ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card hover:border-primary/30"}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-foreground">{t.count}</span>
                <Badge variant={tierVariant(t.tier) as "critical" | "high" | "medium" | "low"}>{t.tier}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{t.tier} Risk Customers</div>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customers by name or industry…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Card className="p-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                    <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk</th>
                    <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                    <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoices</th>
                    <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delayed</th>
                    <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Open Amt</th>
                    <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Prob</th>
                    <th className="text-center p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                            {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">{c.name}</div>
                            <div className="text-xs text-muted-foreground">{c.industry} · {c.region}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><Badge variant={tierVariant(c.riskTier!) as "critical" | "high" | "medium" | "low"}>{c.riskTier}</Badge></td>
                      <td className="p-4 text-right font-mono text-sm font-semibold text-foreground">{(c.riskScore! * 100).toFixed(0)}%</td>
                      <td className="p-4 text-right font-mono text-sm text-foreground">{c.totalInvoices}</td>
                      <td className="p-4 text-right font-mono text-sm text-status-danger">{c.delayedInvoiceCount}</td>
                      <td className="p-4 text-right font-mono text-sm text-foreground">{formatCurrency(c.openInvoiceAmount)}</td>
                      <td className="p-4 text-right font-mono text-sm text-foreground">{(c.avgDelayProbability * 100).toFixed(0)}%</td>
                      <td className="p-4 text-center"><Button variant="ghost" size="sm">View</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {selectedCustomer && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 z-50" onClick={() => setSelectedCustomer(null)} />
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border z-50 overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">{selectedCustomer.name}</h2>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted p-4">
                      <div className="text-xs text-muted-foreground mb-1">Risk Score</div>
                      <div className="font-mono text-2xl font-bold text-foreground">{(selectedCustomer.riskScore! * 100).toFixed(0)}%</div>
                      <Badge variant={tierVariant(selectedCustomer.riskTier!) as "critical" | "high" | "medium" | "low"} className="mt-1">{selectedCustomer.riskTier}</Badge>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <div className="text-xs text-muted-foreground mb-1">Open Exposure</div>
                      <div className="font-mono text-2xl font-bold text-foreground">{formatCurrency(selectedCustomer.openInvoiceAmount)}</div>
                      <div className="font-mono text-xs text-muted-foreground mt-1">{selectedCustomer.openInvoiceCount} invoices</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total Invoices", value: selectedCustomer.totalInvoices },
                      { label: "Delayed", value: selectedCustomer.delayedInvoiceCount },
                      { label: "Overdue", value: selectedCustomer.overdueInvoiceCount },
                      { label: "Avg Payment", value: `${selectedCustomer.avgPaymentDays}d` },
                      { label: "Late Ratio", value: `${(selectedCustomer.latePaymentRatio * 100).toFixed(0)}%` },
                      { label: "Credit Limit", value: formatCurrency(selectedCustomer.creditLimit) },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg bg-muted/50 p-3">
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                        <div className="font-mono text-sm font-semibold mt-0.5 text-foreground">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2 text-foreground">Details</div>
                    <div className="space-y-2 text-sm">
                      {[
                        { label: "Industry", value: selectedCustomer.industry },
                        { label: "Region", value: selectedCustomer.region },
                        { label: "Size", value: selectedCustomer.sizeCategory },
                        { label: "Avg Delay Prob", value: `${(selectedCustomer.avgDelayProbability * 100).toFixed(0)}%` },
                      ].map((d) => (
                        <div key={d.label} className="flex justify-between py-1 border-b border-border">
                          <span className="text-muted-foreground">{d.label}</span>
                          <span className="font-mono text-foreground">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
