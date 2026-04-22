"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CircularGauge } from "@/components/ui/circular-gauge";
import { mockCustomers } from "@/lib/mock-data";
import { formatCurrency, getRiskColor } from "@/lib/utils";
import { Search, X, ArrowUpRight } from "lucide-react";

const tierConfig: Record<string, { color: string; iconBg: string; gaugeFrom: string; gaugeTo: string }> = {
  CRITICAL: { color: "text-red-400", iconBg: "from-red-500/20 to-rose-500/20", gaugeFrom: "#f43f5e", gaugeTo: "#ef4444" },
  HIGH: { color: "text-orange-400", iconBg: "from-orange-500/20 to-amber-500/20", gaugeFrom: "#f97316", gaugeTo: "#f59e0b" },
  MEDIUM: { color: "text-amber-400", iconBg: "from-amber-500/20 to-yellow-500/20", gaugeFrom: "#f59e0b", gaugeTo: "#eab308" },
  LOW: { color: "text-emerald-400", iconBg: "from-emerald-500/20 to-teal-500/20", gaugeFrom: "#10b981", gaugeTo: "#14b8a6" },
};

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
        <h1 className="text-2xl font-bold tracking-tight">Customer Risk</h1>
        <p className="text-sm text-muted-foreground/60 mt-0.5">Monitor customer risk scores and payment behavior.</p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tierCounts.map((t) => {
          const cfg = tierConfig[t.tier];
          return (
            <Card
              key={t.tier}
              className={`cursor-pointer transition-all duration-300 group ${selectedTier === t.tier ? "ring-1 ring-primary/30 border-primary/20" : ""}`}
              onClick={() => setSelectedTier(selectedTier === t.tier ? null : t.tier)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <motion.div
                    className={`text-2xl font-bold tabular-nums ${cfg.color}`}
                    key={t.count}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                  >
                    {t.count}
                  </motion.div>
                  <div className="text-[11px] text-muted-foreground/50">{t.tier} Risk</div>
                </div>
                <div className={`h-8 w-1 rounded-full bg-gradient-to-b ${cfg.iconBg}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
        <Input placeholder="Search customers by name or industry…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Customer Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-[11px] text-muted-foreground/40 uppercase tracking-wider">
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
                {filtered.map((c) => {
                  const cfg = tierConfig[c.riskTier || "LOW"];
                  return (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-white/[0.015] transition-colors cursor-pointer group" onClick={() => setSelectedCustomer(c)}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-[#38bdf8] flex items-center justify-center text-xs font-bold text-white ring-2 ring-background">
                            {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{c.name}</div>
                            <div className="text-[11px] text-muted-foreground/40">{c.industry} · {c.region}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><Badge variant={c.riskTier?.toLowerCase() as "critical" | "high" | "medium" | "low"}>{c.riskTier}</Badge></td>
                      <td className={`p-4 text-right text-sm font-semibold tabular-nums ${getRiskColor(c.riskTier!)}`}>{(c.riskScore! * 100).toFixed(0)}%</td>
                      <td className="p-4 text-right text-sm tabular-nums text-muted-foreground/70">{c.totalInvoices}</td>
                      <td className="p-4 text-right text-sm tabular-nums text-rose-400/80">{c.delayedInvoiceCount}</td>
                      <td className="p-4 text-right text-sm tabular-nums">{formatCurrency(c.openInvoiceAmount)}</td>
                      <td className="p-4 text-right text-sm font-mono tabular-nums text-muted-foreground/60">{(c.avgDelayProbability * 100).toFixed(0)}%</td>
                      <td className="p-4 text-center">
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-foreground/50 transition-colors mx-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Detail Drawer */}
      <AnimatePresence>
        {selectedCustomer && (() => {
          const cfg = tierConfig[selectedCustomer.riskTier || "LOW"];
          return (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setSelectedCustomer(null)} />
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#0a0a0c] border-l border-border z-50 overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold tracking-tight">{selectedCustomer.name}</h2>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-6">
                  {/* Risk Gauge + Exposure */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white/[0.02] border border-border p-5 flex flex-col items-center">
                      <CircularGauge
                        value={selectedCustomer.riskScore || 0}
                        size={100}
                        strokeWidth={7}
                        colorFrom={cfg.gaugeFrom}
                        colorTo={cfg.gaugeTo}
                        id={`drawer-risk-${selectedCustomer.id}`}
                      >
                        <div className="text-center">
                          <div className={`text-xl font-bold tabular-nums ${cfg.color}`}>{(selectedCustomer.riskScore! * 100).toFixed(0)}%</div>
                        </div>
                      </CircularGauge>
                      <div className="text-[11px] text-muted-foreground/40 mt-2">Risk Score</div>
                      <Badge variant={selectedCustomer.riskTier?.toLowerCase() as "critical" | "high" | "medium" | "low"} className="mt-1">{selectedCustomer.riskTier}</Badge>
                    </div>
                    <div className="rounded-xl bg-white/[0.02] border border-border p-5 flex flex-col justify-center">
                      <div className="text-[11px] text-muted-foreground/40 mb-1">Open Exposure</div>
                      <div className="text-2xl font-bold tracking-tight">{formatCurrency(selectedCustomer.openInvoiceAmount)}</div>
                      <div className="text-[11px] text-muted-foreground/40 mt-1">{selectedCustomer.openInvoiceCount} invoices</div>
                    </div>
                  </div>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total Invoices", value: selectedCustomer.totalInvoices },
                      { label: "Delayed", value: selectedCustomer.delayedInvoiceCount },
                      { label: "Overdue", value: selectedCustomer.overdueInvoiceCount },
                      { label: "Avg Payment", value: `${selectedCustomer.avgPaymentDays}d` },
                      { label: "Late Ratio", value: `${(selectedCustomer.latePaymentRatio * 100).toFixed(0)}%` },
                      { label: "Credit Limit", value: formatCurrency(selectedCustomer.creditLimit) },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-white/[0.02] border border-border p-3">
                        <div className="text-[10px] text-muted-foreground/40">{item.label}</div>
                        <div className="text-sm font-semibold mt-0.5 tabular-nums">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {/* Details */}
                  <div>
                    <div className="text-sm font-medium mb-3">Details</div>
                    <div className="space-y-2.5 text-sm">
                      {[
                        { label: "Industry", value: selectedCustomer.industry },
                        { label: "Region", value: selectedCustomer.region },
                        { label: "Size", value: selectedCustomer.sizeCategory },
                        { label: "Avg Delay Prob", value: `${(selectedCustomer.avgDelayProbability * 100).toFixed(0)}%` },
                      ].map((d) => (
                        <div key={d.label} className="flex justify-between">
                          <span className="text-muted-foreground/50">{d.label}</span>
                          <span className="font-medium tabular-nums">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
