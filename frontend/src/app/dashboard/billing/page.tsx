"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { CheckCircle2, Star, Zap } from "lucide-react";

const plans = [
  {
    name: "Starter", price: "Free", period: "", desc: "For small teams getting started",
    features: ["500 invoices/mo", "Basic predictions", "Email alerts", "1 user", "Community support"],
    cta: "Current Plan", current: true, popular: false,
  },
  {
    name: "Pro", price: "$99", period: "/month", desc: "For growing finance teams",
    features: ["10,000 invoices/mo", "Advanced ML models", "Real-time risk scoring", "API access", "5 users", "Priority support", "Custom reports", "Webhook integrations"],
    cta: "Upgrade to Pro", current: false, popular: true,
  },
  {
    name: "Enterprise", price: "Custom", period: "", desc: "For large organizations",
    features: ["Unlimited invoices", "Custom ML models", "SSO & SAML", "Dedicated CSM", "SLA guarantee", "On-premise option", "Audit logs", "Custom integrations"],
    cta: "Contact Sales", current: false, popular: false,
  },
];

export default function BillingPage() {
  return (
    <PageTransition routeKey="billing">
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing & Plans</h1>
          <p className="text-sm text-muted-foreground">Manage your subscription and billing details.</p>
        </div>

        <Card className="border-primary/20 bg-metric-neutral-bg/50">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Starter Plan</span>
                  <Badge>Free</Badge>
                </div>
                <p className="text-sm text-muted-foreground">500 invoices/mo · 1 user · Basic predictions</p>
              </div>
            </div>
            <Button>Upgrade</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="font-medium text-foreground mb-4">Current Usage</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "Invoices", used: 342, total: 500 },
                { label: "Predictions", used: 342, total: 500 },
                { label: "Users", used: 1, total: 1 },
              ].map((u) => (
                <div key={u.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{u.label}</span>
                    <span className="font-mono font-medium text-foreground">{u.used} / {u.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className={`h-2 rounded-full transition-all ${u.used / u.total > 0.8 ? "bg-status-danger" : "bg-primary"}`} style={{ width: `${(u.used / u.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative flex flex-col ${plan.popular ? "border-primary ring-2 ring-primary/20" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <Star className="h-3 w-3" /> Recommended
                </div>
              )}
              <CardContent className="flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="font-mono text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button variant={plan.current ? "outline" : plan.popular ? "default" : "outline"} className="w-full" disabled={plan.current}>
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
