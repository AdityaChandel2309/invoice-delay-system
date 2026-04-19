"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockKPI, mockMonthlyTrends, mockAgingBuckets, mockCustomers, mockInvoices } from "@/lib/mock-data";
import { formatCurrency, formatNumber, formatPercent, getRiskColor } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, Clock,
  Brain, FileText, Users, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const kpiCards = [
  { label: "Total Invoices", value: formatNumber(mockKPI.totalInvoices), icon: FileText, change: "+12.3%", up: true, color: "text-blue-400" },
  { label: "Delay Rate", value: formatPercent(mockKPI.delayRatePct), icon: AlertTriangle, change: "+2.1%", up: false, color: "text-orange-400" },
  { label: "Avg Delay Days", value: `${mockKPI.avgDelayDays}d`, icon: Clock, change: "-0.8d", up: true, color: "text-yellow-400" },
  { label: "Outstanding", value: formatCurrency(mockKPI.totalOutstandingAmount), icon: DollarSign, change: "+5.2%", up: false, color: "text-red-400" },
  { label: "At-Risk Amount", value: formatCurrency(mockKPI.totalAtRiskAmount), icon: TrendingDown, change: "+8.1%", up: false, color: "text-red-400" },
  { label: "Prediction Coverage", value: formatPercent(mockKPI.predictionCoveragePct), icon: Brain, change: "100%", up: true, color: "text-emerald-400" },
];

const bucketColors = ["#10b981", "#3b82f6", "#f59e0b", "#f97316", "#ef4444"];

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
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your invoice payment predictions and risk analysis.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div key={kpi.label} initial="hidden" animate="visible" variants={fadeIn} custom={i}>
            <Card className="hover:border-zinc-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center ${kpi.color}`}>
                    <kpi.icon className="h-4 w-4" />
                  </div>
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                    {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {kpi.change}
                  </span>
                </div>
                <div className="text-xl font-bold">{kpi.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Delay Trend Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Delay Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="gradDelay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", color: "#fafafa", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="delayRate" stroke="#6366f1" fill="url(#gradDelay)" strokeWidth={2} name="Delay Rate %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Aging Buckets */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Aging Buckets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAgingBuckets} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`} />
                  <YAxis type="category" dataKey="bucket" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", color: "#fafafa", fontSize: "12px" }} formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="totalOutstanding" radius={[0, 4, 4, 0]} name="Outstanding">
                    {mockAgingBuckets.map((_, i) => <Cell key={i} fill={bucketColors[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* High Risk Customers */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">High Risk Customers</CardTitle>
            <Badge variant="destructive">{mockCustomers.filter((c) => c.riskTier === "CRITICAL" || c.riskTier === "HIGH").length} flagged</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockCustomers.filter((c) => c.riskTier === "CRITICAL" || c.riskTier === "HIGH").slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                      {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.industry} · {c.region}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.riskTier === "CRITICAL" ? "critical" : "high"}>{c.riskTier}</Badge>
                    <span className={`text-sm font-semibold ${getRiskColor(c.riskTier!)}`}>{(c.riskScore! * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Predictions */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Predictions</CardTitle>
            <Badge>{mockKPI.predictionCoveragePct}% coverage</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockInvoices.slice(0, 5).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-zinc-900/50 transition-colors">
                  <div>
                    <div className="text-sm font-medium">{inv.invoiceNumber}</div>
                    <div className="text-xs text-muted-foreground">{inv.customerName} · {formatCurrency(inv.amount)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {inv.willBeDelayed ? (
                      <Badge variant="critical">Will Delay</Badge>
                    ) : (
                      <Badge variant="success">On Time</Badge>
                    )}
                    <span className="text-sm font-mono text-muted-foreground">{((inv.delayProbability || 0) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
