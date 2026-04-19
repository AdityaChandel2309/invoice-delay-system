"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockCustomers } from "@/lib/mock-data";
import { formatCurrency, getRiskColor } from "@/lib/utils";
import { Search, X, Users, AlertTriangle, Shield, TrendingUp } from "lucide-react";

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
  const tierCounts = tiers.map((t) => ({ tier: t, count: mockCustomers.filter((c) => c.riskTier === t).length }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Risk</h1>
        <p className="text-sm text-muted-foreground">Monitor customer risk scores and payment behavior.</p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tierCounts.map((t) => (
          <Card key={t.tier} className={`cursor-pointer transition-all ${selectedTier === t.tier ? "border-primary" : "hover:border-zinc-700"}`} onClick={() => setSelectedTier(selectedTier === t.tier ? null : t.tier)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getRiskColor(t.tier)}`}>{t.count}</div>
                <div className="text-xs text-muted-foreground">{t.tier} Risk</div>
              </div>
              <Badge variant={t.tier.toLowerCase() as "critical" | "high" | "medium" | "low"}>{t.tier}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers by name or industry…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Customer Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Risk</th>
                  <th className="text-right p-4 font-medium">Score</th>
                  <th className="text-right p-4 font-medium">Invoices</th>
                  <th className="text-right p-4 font-medium">Delayed</th>
                  <th className="text-right p-4 font-medium">Open Amount</th>
                  <th className="text-right p-4 font-medium">Avg Prob</th>
                  <th className="text-center p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-zinc-900/50 transition-colors cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                          {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.industry} · {c.region}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><Badge variant={c.riskTier?.toLowerCase() as "critical" | "high" | "medium" | "low"}>{c.riskTier}</Badge></td>
                    <td className={`p-4 text-right text-sm font-semibold ${getRiskColor(c.riskTier!)}`}>{(c.riskScore! * 100).toFixed(0)}%</td>
                    <td className="p-4 text-right text-sm">{c.totalInvoices}</td>
                    <td className="p-4 text-right text-sm text-red-400">{c.delayedInvoiceCount}</td>
                    <td className="p-4 text-right text-sm">{formatCurrency(c.openInvoiceAmount)}</td>
                    <td className="p-4 text-right text-sm font-mono">{(c.avgDelayProbability * 100).toFixed(0)}%</td>
                    <td className="p-4 text-center"><Button variant="ghost" size="sm">View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Detail Drawer */}
      <AnimatePresence>
        {selectedCustomer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedCustomer(null)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed right-0 top-0 h-full w-full max-w-lg bg-zinc-950 border-l border-border z-50 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">{selectedCustomer.name}</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}><X className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-zinc-900 p-4">
                    <div className="text-xs text-muted-foreground mb-1">Risk Score</div>
                    <div className={`text-2xl font-bold ${getRiskColor(selectedCustomer.riskTier!)}`}>{(selectedCustomer.riskScore! * 100).toFixed(0)}%</div>
                    <Badge variant={selectedCustomer.riskTier?.toLowerCase() as "critical" | "high" | "medium" | "low"} className="mt-1">{selectedCustomer.riskTier}</Badge>
                  </div>
                  <div className="rounded-lg bg-zinc-900 p-4">
                    <div className="text-xs text-muted-foreground mb-1">Open Exposure</div>
                    <div className="text-2xl font-bold">{formatCurrency(selectedCustomer.openInvoiceAmount)}</div>
                    <div className="text-xs text-muted-foreground mt-1">{selectedCustomer.openInvoiceCount} invoices</div>
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
                    <div key={item.label} className="rounded-lg bg-zinc-900/50 p-3">
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      <div className="text-sm font-semibold mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Details</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Industry</span><span>{selectedCustomer.industry}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Region</span><span>{selectedCustomer.region}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Size</span><span>{selectedCustomer.sizeCategory}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Avg Delay Prob</span><span className="font-mono">{(selectedCustomer.avgDelayProbability * 100).toFixed(0)}%</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
