"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { Brain, Zap, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";

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
          { name: "Late Payment Ratio", impact: lpr * 0.40, direction: (lpr > 0.3 ? "up" : "down") as "up" | "down" },
          { name: "Avg Payment Days", impact: Math.min(apd / 120, 1) * 0.25, direction: (apd > 45 ? "up" : "down") as "up" | "down" },
          { name: "Amount / Credit Ratio", impact: Math.min(amt / cl, 1) * 0.20, direction: (amt / cl > 0.5 ? "up" : "down") as "up" | "down" },
          { name: "Customer Tenure", impact: Math.max(0, 1 - tenure / 730) * 0.10, direction: (tenure < 365 ? "up" : "down") as "up" | "down" },
          { name: "Month-End Effect", impact: form.isMonthEnd ? 0.05 : 0, direction: (form.isMonthEnd ? "up" : "down") as "up" | "down" },
        ].sort((a, b) => b.impact - a.impact),
      });
      setLoading(false);
    }, 1500);
  };

  const tierVariant = (t: string) => t === "CRITICAL" ? "critical" : t === "HIGH" ? "high" : t === "MEDIUM" ? "medium" : "low";

  return (
    <PageTransition routeKey="predictions">
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Predict Delay</h1>
          <p className="text-sm text-muted-foreground">Enter invoice and customer details for an AI-powered delay prediction.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Prediction Input</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1.5 block text-foreground">Invoice Amount ($)</label><Input type="number" value={form.invoiceAmount} onChange={(e) => setForm({ ...form, invoiceAmount: e.target.value })} /></div>
                <div><label className="text-sm font-medium mb-1.5 block text-foreground">Days to Due</label><Input type="number" value={form.daysToDue} onChange={(e) => setForm({ ...form, daysToDue: e.target.value })} /></div>
                <div><label className="text-sm font-medium mb-1.5 block text-foreground">Avg Payment Days</label><Input type="number" value={form.avgPaymentDays} onChange={(e) => setForm({ ...form, avgPaymentDays: e.target.value })} /></div>
                <div><label className="text-sm font-medium mb-1.5 block text-foreground">Late Payment Ratio</label><Input type="number" step="0.01" value={form.latePaymentRatio} onChange={(e) => setForm({ ...form, latePaymentRatio: e.target.value })} /></div>
                <div><label className="text-sm font-medium mb-1.5 block text-foreground">Credit Limit ($)</label><Input type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} /></div>
                <div><label className="text-sm font-medium mb-1.5 block text-foreground">Tenure (days)</label><Input type="number" value={form.customerTenureDays} onChange={(e) => setForm({ ...form, customerTenureDays: e.target.value })} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={form.isMonthEnd} onChange={(e) => setForm({ ...form, isMonthEnd: e.target.checked })} className="rounded border-border" />
                Invoice issued at month-end
              </label>
              <Button onClick={handlePredict} className="w-full gap-2" size="lg" disabled={loading}>
                {loading ? <><div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Analyzing…</> : <><Zap className="h-4 w-4" /> Run Prediction</>}
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className={result.willBeDelayed ? "border-status-danger/30" : "border-status-healthy/30"}>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2">
                    {result.willBeDelayed ? <AlertTriangle className="h-4 w-4 text-status-danger" /> : <CheckCircle2 className="h-4 w-4 text-status-healthy" />}
                    Prediction Result
                  </CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center py-4">
                      <div className={`font-mono text-5xl font-bold mb-2 ${result.willBeDelayed ? "text-status-danger" : "text-status-healthy"}`}>
                        {(result.probability * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Delay Probability</div>
                      <Badge variant={tierVariant(result.riskTier) as "critical" | "high" | "medium" | "low"} className="mt-2">{result.riskTier} RISK</Badge>
                    </div>

                    <div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${result.probability * 100}%` }} transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-3 rounded-full ${result.probability >= 0.7 ? "bg-status-danger" : result.probability >= 0.4 ? "bg-status-warning" : "bg-status-healthy"}`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>Low Risk</span><span>High Risk</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted p-3 text-center">
                        <div className="font-mono text-xl font-bold text-foreground">{result.predictedDays}d</div>
                        <div className="text-xs text-muted-foreground">Predicted Delay</div>
                      </div>
                      <div className="rounded-lg bg-muted p-3 text-center">
                        <div className="font-mono text-xl font-bold text-foreground">{result.willBeDelayed ? "Yes" : "No"}</div>
                        <div className="text-xs text-muted-foreground">Will Be Delayed</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-3 flex items-center gap-1.5 text-foreground"><BarChart3 className="h-4 w-4 text-primary" /> Factor Importance</div>
                      <div className="space-y-2">
                        {result.factors.map((f) => (
                          <div key={f.name}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{f.name}</span>
                              <span className={`font-mono ${f.direction === "up" ? "text-status-danger" : "text-status-healthy"}`}>
                                {f.direction === "up" ? "↑" : "↓"} {(f.impact * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(f.impact * 200, 100)}%` }} transition={{ duration: 0.8 }}
                                className={`h-1.5 rounded-full ${f.direction === "up" ? "bg-status-danger/70" : "bg-status-healthy/70"}`}
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
                <Card className="h-full flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center py-16">
                    <Brain className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">No prediction yet</h3>
                    <p className="text-sm text-muted-foreground">Fill in the form and click &quot;Run Prediction&quot; to get AI-powered delay analysis.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
