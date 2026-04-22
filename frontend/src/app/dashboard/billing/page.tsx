"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularGauge } from "@/components/ui/circular-gauge";
import { CheckCircle2, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  { name: "Starter", price: "Free", period: "", desc: "For small teams getting started", features: ["500 invoices/mo", "Basic predictions", "Email alerts", "1 user", "Community support"], cta: "Current Plan", current: true, popular: false },
  { name: "Pro", price: "$99", period: "/month", desc: "For growing finance teams", features: ["10,000 invoices/mo", "Advanced ML models", "Real-time risk scoring", "API access", "5 users", "Priority support", "Custom reports", "Webhook integrations"], cta: "Upgrade to Pro", current: false, popular: true },
  { name: "Enterprise", price: "Custom", period: "", desc: "For large organizations", features: ["Unlimited invoices", "Custom ML models", "SSO & SAML", "Dedicated CSM", "SLA guarantee", "On-premise option", "Audit logs", "Custom integrations"], cta: "Contact Sales", current: false, popular: false },
];

const usageItems = [
  { label: "Invoices", used: 342, total: 500 },
  { label: "Predictions", used: 342, total: 500 },
  { label: "Users", used: 1, total: 1 },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-sm text-muted-foreground/60 mt-0.5">Manage your subscription and billing details.</p>
      </div>

      <Card className="border-primary/15 bg-gradient-to-r from-primary/[0.04] to-[#38bdf8]/[0.02]">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-[#38bdf8]/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Starter Plan</span>
                <Badge>Free</Badge>
              </div>
              <p className="text-sm text-muted-foreground/50">500 invoices/mo · 1 user · Basic predictions</p>
            </div>
          </div>
          <Button>Upgrade</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-5">Current Usage</h3>
          <div className="grid grid-cols-3 gap-8">
            {usageItems.map((u) => (
              <div key={u.label} className="flex flex-col items-center">
                <CircularGauge
                  value={u.used / u.total}
                  size={80}
                  strokeWidth={6}
                  colorFrom={u.used / u.total > 0.8 ? "#f43f5e" : "#7c5cfc"}
                  colorTo={u.used / u.total > 0.8 ? "#ef4444" : "#38bdf8"}
                  id={`usage-${u.label}`}
                >
                  <div className="text-xs font-bold tabular-nums">{Math.round((u.used / u.total) * 100)}%</div>
                </CircularGauge>
                <div className="text-sm font-medium mt-2">{u.label}</div>
                <div className="text-[11px] text-muted-foreground/40 tabular-nums">{u.used} / {u.total}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-5">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`relative flex flex-col h-full shimmer-border ${plan.popular ? "border-primary/30 shadow-[0_0_40px_rgba(124,92,252,0.06)]" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-[#38bdf8] px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-primary/20">
                  <Star className="h-3 w-3" /> Recommended
                </div>
              )}
              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-muted-foreground/50 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground/50 mb-6">{plan.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary/60 shrink-0" />
                      <span className="text-muted-foreground/70">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.current ? "outline" : plan.popular ? "default" : "outline"} className="w-full" disabled={plan.current}>
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
