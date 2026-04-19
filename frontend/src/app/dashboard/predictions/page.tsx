"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brain, Zap, TrendingUp, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";

interface PredResult {
  willBeDelayed: boolean;
  probability: number;
  predictedDays: number;
  riskTier: string;
  factors: { name: string; impact: number; direction: "up" | "down" }[];
}

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
        <h1 className="text-2xl font-bold">Predict Delay</h1>
        <p className="text-sm text-muted-foreground">Enter invoice and customer details to get an AI-powered delay prediction.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Prediction Input</CardTitle>
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
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isMonthEnd} onChange={(e) => setForm({ ...form, isMonthEnd: e.target.checked })} className="rounded border-zinc-700" />
              Invoice issued at month-end
            </label>
            <Button onClick={handlePredict} className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing…</> : <><Zap className="h-4 w-4" /> Run Prediction</>}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className={`${result.willBeDelayed ? "border-red-500/30 glow-danger" : "border-emerald-500/30 glow-success"}`}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {result.willBeDelayed ? <AlertTriangle className="h-4 w-4 text-red-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    Prediction Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Result */}
                  <div className="text-center py-4">
                    <div className={`text-5xl font-bold font-mono mb-2 ${result.willBeDelayed ? "text-red-400" : "text-emerald-400"}`}>
                      {(result.probability * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Delay Probability</div>
                    <Badge variant={result.riskTier.toLowerCase() as "critical" | "high" | "medium" | "low"} className="mt-2">{result.riskTier} RISK</Badge>
                  </div>

                  {/* Gauge Bar */}
                  <div>
                    <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${result.probability * 100}%` }} transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-3 rounded-full ${result.probability >= 0.7 ? "bg-gradient-to-r from-orange-500 to-red-500" : result.probability >= 0.4 ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-emerald-500 to-green-500"}`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Low Risk</span><span>High Risk</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-zinc-900 p-3 text-center">
                      <div className="text-xl font-bold">{result.predictedDays}d</div>
                      <div className="text-xs text-muted-foreground">Predicted Delay</div>
                    </div>
                    <div className="rounded-lg bg-zinc-900 p-3 text-center">
                      <div className="text-xl font-bold">{result.willBeDelayed ? "Yes" : "No"}</div>
                      <div className="text-xs text-muted-foreground">Will Be Delayed</div>
                    </div>
                  </div>

                  {/* Factor Importance */}
                  <div>
                    <div className="text-sm font-medium mb-3 flex items-center gap-1.5"><BarChart3 className="h-4 w-4 text-primary" /> Factor Importance</div>
                    <div className="space-y-2">
                      {result.factors.map((f) => (
                        <div key={f.name}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{f.name}</span>
                            <span className={f.direction === "up" ? "text-red-400" : "text-emerald-400"}>
                              {f.direction === "up" ? "↑" : "↓"} {(f.impact * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-zinc-800">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(f.impact * 200, 100)}%` }} transition={{ duration: 0.8 }}
                              className={`h-1.5 rounded-full ${f.direction === "up" ? "bg-red-500/70" : "bg-emerald-500/70"}`}
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
                  <Brain className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No prediction yet</h3>
                  <p className="text-sm text-muted-foreground">Fill in the form and click &quot;Run Prediction&quot; to get AI-powered delay analysis.</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
