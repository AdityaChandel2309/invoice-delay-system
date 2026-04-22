"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { PageTransition } from "@/components/page-transition";
import { mockKPI, mockMonthlyTrends, mockAgingBuckets, mockCustomers, mockInvoices } from "@/lib/mock-data";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import {
  TrendingDown, DollarSign, AlertTriangle, Clock,
  Brain, FileText,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const bucketColors = [
  "var(--status-healthy)", "var(--chart-1)", "var(--status-warning)", "var(--chart-2)", "var(--status-danger)"
];

const trendData = mockMonthlyTrends.map((t) => ({
  month: t.month.slice(5),
  delayRate: t.delayRatePct,
  invoices: t.totalInvoices,
  delayed: t.delayedInvoices,
}));

export default function DashboardPage() {
  return (
    <PageTransition routeKey="dashboard">
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your invoice payment predictions and risk analysis.</p>
        </div>

        {/* KPI Cards — using MetricCard */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={0}>
            <MetricCard label="Total Invoices" value={formatNumber(mockKPI.totalInvoices)} icon={FileText} accentColor="neutral" trend={{ direction: "up", percentage: 12.3 }} />
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={1}>
            <MetricCard label="Delay Rate" value={formatPercent(mockKPI.delayRatePct)} icon={AlertTriangle} accentColor="warning" trend={{ direction: "down", percentage: 2.1 }} />
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={2}>
            <MetricCard label="Avg Delay Days" value={`${mockKPI.avgDelayDays}d`} icon={Clock} accentColor="warning" trend={{ direction: "up", percentage: 0.8 }} />
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={3}>
            <MetricCard label="Outstanding" value={formatCurrency(mockKPI.totalOutstandingAmount)} icon={DollarSign} accentColor="danger" trend={{ direction: "down", percentage: 5.2 }} />
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={4}>
            <MetricCard label="At-Risk Amount" value={formatCurrency(mockKPI.totalAtRiskAmount)} icon={TrendingDown} accentColor="danger" trend={{ direction: "down", percentage: 8.1 }} />
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={5}>
            <MetricCard label="Prediction Coverage" value={formatPercent(mockKPI.predictionCoveragePct)} icon={Brain} accentColor="healthy" trend={{ direction: "up", percentage: 100 }} />
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Delay Trend Chart */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Monthly Delay Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="gradDelay" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--card-foreground)", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="delayRate" stroke="var(--primary)" fill="url(#gradDelay)" strokeWidth={2} name="Delay Rate %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Aging Buckets */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Aging Buckets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockAgingBuckets} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(0)}M`} />
                    <YAxis type="category" dataKey="bucket" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--card-foreground)", fontSize: "12px" }} formatter={(v) => formatCurrency(Number(v))} />
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">High Risk Customers</CardTitle>
              <Badge variant="critical">{mockCustomers.filter((c) => c.riskTier === "CRITICAL" || c.riskTier === "HIGH").length} flagged</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockCustomers.filter((c) => c.riskTier === "CRITICAL" || c.riskTier === "HIGH").slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.industry} · {c.region}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.riskTier === "CRITICAL" ? "critical" : "high"}>{c.riskTier}</Badge>
                      <span className="font-mono text-sm font-semibold text-foreground">{(c.riskScore! * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Predictions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Predictions</CardTitle>
              <Badge>{mockKPI.predictionCoveragePct}% coverage</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockInvoices.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-mono text-sm font-medium text-foreground">{inv.invoiceNumber}</div>
                      <div className="text-xs text-muted-foreground">{inv.customerName} · {formatCurrency(inv.amount)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {inv.willBeDelayed ? (
                        <Badge variant="critical">Will Delay</Badge>
                      ) : (
                        <Badge variant="success">On Time</Badge>
                      )}
                      <span className="font-mono text-sm text-muted-foreground">{((inv.delayProbability || 0) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
