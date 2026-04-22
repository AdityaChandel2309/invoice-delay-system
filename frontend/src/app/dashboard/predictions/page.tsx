"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CircularGauge } from "@/components/ui/circular-gauge";
import { Brain, Zap, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";

interface PredResult {
  willBeDelayed: boolean;
  probability: number;
  predictedDays: number;
  riskTier: string;
  factors: { name: string; impact: number; direction: "up" | "down" }[];
}

const gaugeColors: Record<string, { from: string; to: string }> = {
  CRITICAL: { from: "#f43f5e", to: "#ef4444" },
  HIGH: { from: "#f97316", to: "#f59e0b" },
  MEDIUM: { from: "#f59e0b", to: "#eab308" },
  LOW: { from: "#10b981", to: "#38bdf8" },
};

export default function PredictionsPage() {
  const [form, setForm] = useState({ invoiceAmount: "50000", daysToDue: "30", avgPaymentDays: "35", latePaymentRatio: "0.25", creditLimit: "100000", customerTenureDays: "365", isMonthEnd: false });
  const [result, setResult] = useState<PredResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const lpr = parseFloat(form.latePaymentRatio);
      const apd = parseFloat(form.avgPaymentDays);
      const amt = parseFloat(form.invoiceAmount);
      const cl = parseFloat(form.creditLimit);
      const tenure = parseFloat(form.customerTenureDays);
      const score = lpr * 0.40 + Math.min(apd / 120, 1) * 0.25 + Math.min(amt / cl, 1) * 0.20 + Math.max(0, 1 - tenure / 730) * 0.10 + (form.isMonthEnd ? 0.05 : 0);
      const prob = Math.max(0, Math.min(1, score));
      setResult({
        willBeDelayed: prob >= 0.5,
        probability: prob,
        predictedDays: prob >= 0.5 ? Math.round(prob * 30) : 0,
        riskTier: prob >= 0.8 ? "CRITICAL" : prob >= 0.6 ? "HIGH" : prob >= 0.3 ? "MEDIUM" : "LOW",
        factors: [
          { name: "Late Payment Ratio", impact: lpr * 0.40, direction: lpr > 0.3 ? "up" as const : "down" as const },
          { name: "Avg Payment Days", impact: Math.min(apd / 120, 1) * 0.25, direction: apd > 45 ? "up" as const : "down" as const },
          { name: "Amount / Credit Ratio", impact: Math.min(amt / cl, 1) * 0.20, direction: amt / cl > 0.5 ? "up" as const : "down" as const },
          { name: "Customer Tenure", impact: Math.max(0, 1 - tenure / 730) * 0.10, direction: tenure < 365 ? "up" as const : "down" as const },
          { name: "Month-End Effect", impact: form.isMonthEnd ? 0.05 : 0, direction: form.isMonthEnd ? "up" as const : "down" as const },
        ].sort((a, b) => b.impact - a.impact),
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Predict Delay</h1>
        <p className="text-sm text-muted-foreground/60 mt-0.5">Enter invoice and customer details to get an AI-powered delay prediction.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 tracking-tight"><Brain className="h-4 w-4 text-primary" /> Prediction Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Invoice Amount ($)</label><Input type="number" value={form.invoiceAmount} onChange={(e) => setForm({ ...form, invoiceAmount: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Days to Due</label><Input type="number" value={form.daysToDue} onChange={(e) => setForm({ ...form, daysToDue: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Avg Payment Days</label><Input type="number" value={form.avgPaymentDays} onChange={(e) => setForm({ ...form, avgPaymentDays: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Late Payment Ratio</label><Input type="number" step="0.01" value={form.latePaymentRatio} onChange={(e) => setForm({ ...form, latePaymentRatio: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Credit Limit ($)</label><Input type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Customer Tenure (days)</label><Input type="number" value={form.customerTenureDays} onChange={(e) => setForm({ ...form, customerTenureDays: e.target.value })} /></div>
            </div>
            <label className="flex items-center gap-2.5 text-sm text-muted-foreground/70">
              <input type="checkbox" checked={form.isMonthEnd} onChange={(e) => setForm({ ...form, isMonthEnd: e.target.checked })} className="rounded border-border bg-white/[0.02] accent-primary" />
              Invoice issued at month-end
            </label>
            <Button onClick={handlePredict} className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? (
                <>
                  {/* Neural network loading animation */}
                  <div className="relative h-5 w-5">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  </div>
                  Analyzing…
                </>
              ) : (
                <><Zap className="h-4 w-4" /> Run Prediction</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ ease: "easeOut" }}>
              <Card className={`${result.willBeDelayed ? "glow-danger" : "glow-success"}`}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 tracking-tight">
                    {result.willBeDelayed ? <AlertTriangle className="h-4 w-4 text-rose-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    Prediction Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Circular Gauge */}
                  <div className="flex justify-center py-2">
                    <CircularGauge
                      value={result.probability}
                      size={160}
                      strokeWidth={10}
                      colorFrom={gaugeColors[result.riskTier]?.from || "#7c5cfc"}
                      colorTo={gaugeColors[result.riskTier]?.to || "#38bdf8"}
                      id="prediction-gauge"
                    >
                      <div className="text-center">
                        <div className={`text-3xl font-bold font-mono tabular-nums ${result.willBeDelayed ? "text-rose-400" : "text-emerald-400"}`}>
                          {(result.probability * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-muted-foreground/40 mt-0.5">Delay Probability</div>
                      </div>
                    </CircularGauge>
                  </div>

                  <div className="flex justify-center">
                    <Badge variant={result.riskTier.toLowerCase() as "critical" | "high" | "medium" | "low"}>{result.riskTier} RISK</Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[0.02] border border-border p-3.5 text-center">
                      <div className="text-xl font-bold tabular-nums">{result.predictedDays}d</div>
                      <div className="text-[10px] text-muted-foreground/40">Predicted Delay</div>
                    </div>
                    <div className="rounded-xl bg-white/[0.02] border border-border p-3.5 text-center">
                      <div className="text-xl font-bold">{result.willBeDelayed ? "Yes" : "No"}</div>
                      <div className="text-[10px] text-muted-foreground/40">Will Be Delayed</div>
                    </div>
                  </div>

                  {/* Factor Importance */}
                  <div>
                    <div className="text-sm font-medium mb-3.5 flex items-center gap-1.5"><BarChart3 className="h-4 w-4 text-primary" /> Factor Importance</div>
                    <div className="space-y-3">
                      {result.factors.map((f) => (
                        <div key={f.name}>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground/50">{f.name}</span>
                            <span className={`font-mono tabular-nums ${f.direction === "up" ? "text-rose-400/80" : "text-emerald-400/80"}`}>
                              {f.direction === "up" ? "↑" : "↓"} {(f.impact * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(f.impact * 200, 100)}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={`h-full rounded-full ${f.direction === "up" ? "bg-gradient-to-r from-rose-500/50 to-rose-500/70" : "bg-gradient-to-r from-emerald-500/50 to-emerald-500/70"}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <div className="relative mx-auto mb-5 w-16 h-16">
                    <div className="absolute inset-0 rounded-full bg-primary/[0.04]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-muted-foreground/20" />
                    </div>
                    <div className="absolute inset-0 rounded-full border border-dashed border-primary/10 animate-spin-slow" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No prediction yet</h3>
                  <p className="text-sm text-muted-foreground/50">Fill in the form and click &quot;Run Prediction&quot; to get AI-powered delay analysis.</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
