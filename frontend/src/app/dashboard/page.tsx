"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Sparkline } from "@/components/ui/sparkline";
import { mockKPI, mockMonthlyTrends, mockAgingBuckets, mockCustomers, mockInvoices } from "@/lib/mock-data";
import { formatCurrency, getRiskColor } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, Clock,
  Brain, FileText, Users, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" as const } }),
};

const sparkData = {
  invoices: [420, 480, 510, 520, 580, 610, 640],
  delay: [31, 33, 35, 31, 35, 36, 34],
  avgDays: [12, 13, 14, 12, 15, 16, 15],
  outstanding: [30, 32, 35, 33, 37, 38, 41],
  atRisk: [140, 155, 160, 158, 172, 180, 185],
  coverage: [95, 96, 97, 98, 99, 100, 100],
};

const kpiCards = [
  { label: "Total Invoices", value: mockKPI.totalInvoices, format: "number" as const, icon: FileText, change: "+12.3%", up: true, color: "text-blue-400", iconBg: "from-blue-500/20 to-indigo-500/20", spark: sparkData.invoices, sparkColor: "#60a5fa" },
  { label: "Delay Rate", value: mockKPI.delayRatePct, format: "percent" as const, icon: AlertTriangle, change: "+2.1%", up: false, color: "text-orange-400", iconBg: "from-orange-500/20 to-amber-500/20", spark: sparkData.delay, sparkColor: "#fb923c" },
  { label: "Avg Delay Days", value: mockKPI.avgDelayDays, format: "d" as const, icon: Clock, change: "-0.8d", up: true, color: "text-amber-400", iconBg: "from-amber-500/20 to-yellow-500/20", spark: sparkData.avgDays, sparkColor: "#fbbf24", decimals: 1 },
  { label: "Outstanding", value: mockKPI.totalOutstandingAmount, format: "currency" as const, icon: DollarSign, change: "+5.2%", up: false, color: "text-rose-400", iconBg: "from-rose-500/20 to-pink-500/20", spark: sparkData.outstanding, sparkColor: "#fb7185" },
  { label: "At-Risk Amount", value: mockKPI.totalAtRiskAmount, format: "currency" as const, icon: TrendingDown, change: "+8.1%", up: false, color: "text-red-400", iconBg: "from-red-500/20 to-rose-500/20", spark: sparkData.atRisk, sparkColor: "#f87171", danger: true },
  { label: "Prediction Coverage", value: mockKPI.predictionCoveragePct, format: "percent" as const, icon: Brain, change: "100%", up: true, color: "text-emerald-400", iconBg: "from-emerald-500/20 to-teal-500/20", spark: sparkData.coverage, sparkColor: "#34d399" },
];

const bucketColors = ["#34d399", "#60a5fa", "#fbbf24", "#fb923c", "#f87171"];

const trendData = mockMonthlyTrends.map((t) => ({
  month: t.month.slice(5),
  delayRate: t.delayRatePct,
  invoices: t.totalInvoices,
  delayed: t.delayedInvoices,
}));

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground/60 mt-0.5">Overview of your invoice payment predictions and risk analysis.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-border rounded-lg p-0.5">
          {["7d", "30d", "90d", "1y"].map((range, i) => (
            <button
              key={range}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-200 ${
                i === 1 ? "bg-primary/10 text-primary" : "text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.03]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards — Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div key={kpi.label} initial="hidden" animate="visible" variants={fadeIn} custom={i}>
            <Card className={`group relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] ${kpi.danger ? "hover:shadow-[0_0_30px_rgba(248,113,113,0.06)]" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${kpi.iconBg} flex items-center justify-center ${kpi.color} transition-transform duration-300 group-hover:scale-110`}>
                    <kpi.icon className="h-4 w-4" />
                  </div>
                  <Sparkline
                    data={kpi.spark}
                    width={56}
                    height={24}
                    color={kpi.sparkColor}
                    id={`kpi-${i}`}
                  />
                </div>
                <div className="text-xl font-bold tracking-tight">
                  <AnimatedCounter
                    value={kpi.value}
                    format={kpi.format}
                    decimals={kpi.decimals || (kpi.format === "percent" ? 1 : 0)}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-[11px] text-muted-foreground/50">{kpi.label}</div>
                  <span className={`text-[10px] font-medium flex items-center gap-0.5 ${kpi.up ? "text-emerald-400/80" : "text-rose-400/80"}`}>
                    {kpi.up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                    {kpi.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Delay Trend Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold tracking-tight">Monthly Delay Trend</CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
                  <div className="h-2 w-2 rounded-full bg-primary" /> Delay Rate
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="gradDelay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c5cfc" stopOpacity={0.2} />
                      <stop offset="50%" stopColor="#7c5cfc" stopOpacity={0.05} />
                      <stop offset="100%" stopColor="#7c5cfc" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(139,139,158,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(139,139,158,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(14,14,18,0.95)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "10px",
                      color: "#f0f0f3",
                      fontSize: "12px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      backdropFilter: "blur(12px)",
                    }}
                  />
                  <Area type="monotone" dataKey="delayRate" stroke="#7c5cfc" fill="url(#gradDelay)" strokeWidth={2} name="Delay Rate %" dot={false} activeDot={{ r: 4, fill: "#7c5cfc", stroke: "#050507", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Aging Buckets */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold tracking-tight">Aging Buckets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAgingBuckets} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "rgba(139,139,158,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`} />
                  <YAxis type="category" dataKey="bucket" tick={{ fill: "rgba(139,139,158,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(14,14,18,0.95)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "10px",
                      color: "#f0f0f3",
                      fontSize: "12px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                    formatter={(v) => formatCurrency(Number(v))}
                  />
                  <Bar dataKey="totalOutstanding" radius={[0, 6, 6, 0]} name="Outstanding">
                    {mockAgingBuckets.map((_, i) => <Cell key={i} fill={bucketColors[i]} fillOpacity={0.7} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* High Risk Customers */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold tracking-tight">High Risk Customers</CardTitle>
            <Badge variant="destructive">{mockCustomers.filter((c) => c.riskTier === "CRITICAL" || c.riskTier === "HIGH").length} flagged</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockCustomers.filter((c) => c.riskTier === "CRITICAL" || c.riskTier === "HIGH").slice(0, 5).map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08, ease: "easeOut" as const }}
                  className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-white/[0.02] hover:border-border-hover transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full bg-gradient-to-br from-primary to-[#38bdf8] flex items-center justify-center text-xs font-bold text-white ring-2 ring-background transition-transform duration-200 group-hover:scale-105`}>
                      {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground/50">{c.industry} · {c.region}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Badge variant={c.riskTier === "CRITICAL" ? "critical" : "high"}>{c.riskTier}</Badge>
                    <span className={`text-sm font-semibold tabular-nums ${getRiskColor(c.riskTier!)}`}>{(c.riskScore! * 100).toFixed(0)}%</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Predictions */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold tracking-tight">Recent Predictions</CardTitle>
            <Badge>{mockKPI.predictionCoveragePct}% coverage</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockInvoices.slice(0, 5).map((inv, i) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08, ease: "easeOut" as const }}
                  className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-white/[0.02] hover:border-border-hover transition-all duration-200 group cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-medium font-mono">{inv.invoiceNumber}</div>
                    <div className="text-[11px] text-muted-foreground/50">{inv.customerName} · {formatCurrency(inv.amount)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {inv.willBeDelayed ? (
                      <Badge variant="critical">Will Delay</Badge>
                    ) : (
                      <Badge variant="success">On Time</Badge>
                    )}
                    <span className="text-sm font-mono text-muted-foreground/60 tabular-nums">{((inv.delayProbability || 0) * 100).toFixed(0)}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
