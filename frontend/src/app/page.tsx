"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Zap, Brain, ShieldCheck, BarChart3, ArrowRight, CheckCircle2,
  TrendingUp, Users, FileText, Star, ChevronRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const features = [
  { icon: Brain, title: "AI-Powered Predictions", desc: "XGBoost models predict payment delays with 92% accuracy before they happen." },
  { icon: ShieldCheck, title: "Risk Scoring", desc: "Automated customer risk tiers — LOW, MEDIUM, HIGH, CRITICAL — updated in real-time." },
  { icon: BarChart3, title: "Executive Dashboards", desc: "KPIs, aging buckets, trend analysis, and drill-down reports at a glance." },
  { icon: TrendingUp, title: "Trend Analysis", desc: "Monthly delay trends by region, industry, and category with forecasting." },
  { icon: Users, title: "Customer Intelligence", desc: "Deep customer profiles with payment history, risk factors, and invoice analytics." },
  { icon: FileText, title: "Invoice Explorer", desc: "Search, filter, and analyze every invoice with real-time prediction overlays." },
];

const plans = [
  { name: "Starter", price: "Free", desc: "For small teams getting started", features: ["500 invoices/mo", "Basic predictions", "Email alerts", "1 user"], cta: "Get Started" },
  { name: "Pro", price: "$99", desc: "For growing finance teams", features: ["10,000 invoices/mo", "Advanced ML models", "Risk scoring", "API access", "5 users", "Priority support"], cta: "Start Free Trial", popular: true },
  { name: "Enterprise", price: "Custom", desc: "For large organizations", features: ["Unlimited invoices", "Custom models", "SSO & SAML", "Dedicated CSM", "SLA guarantee", "On-premise option"], cta: "Contact Sales" },
];

const testimonials = [
  { name: "Sarah Chen", role: "CFO, TechFlow Inc.", quote: "DelayIQ reduced our late payments by 42% in the first quarter. The AI predictions are remarkably accurate.", avatar: "SC" },
  { name: "Marcus Johnson", role: "AR Manager, GlobalShip", quote: "We saved $2.1M in late fees last year. The risk scoring helps us prioritize collections perfectly.", avatar: "MJ" },
  { name: "Elena Rodriguez", role: "Finance Director, MedSupply Co.", quote: "The dashboard gives our team complete visibility. We catch problems before they become crises.", avatar: "ER" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">DelayIQ</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link href="/signup"><Button size="sm">Start Free Trial</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6">
              <Zap className="h-3.5 w-3.5" />
              <span>AI-Powered Payment Intelligence</span>
            </div>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Predict invoice delays<br />
            <span className="gradient-text">before they happen</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            DelayIQ uses machine learning to predict which invoices will be paid late, score customer risk, and give your finance team the intelligence to act proactively.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex items-center justify-center gap-4">
            <Link href="/signup"><Button size="lg" className="gap-2">Start Free Trial <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/dashboard"><Button size="lg" variant="outline" className="gap-2">View Demo <ChevronRight className="h-4 w-4" /></Button></Link>
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 14-day free trial</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Cancel anytime</span>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border/50">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "92%", label: "Prediction Accuracy" },
            { value: "42%", label: "Fewer Late Payments" },
            { value: "$2.1M", label: "Avg. Annual Savings" },
            { value: "500+", label: "Companies Trust Us" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to<br /><span className="gradient-text">eliminate payment delays</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Built for modern finance teams who want to move from reactive collections to proactive cash flow management.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-zinc-950/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-xl border p-6 flex flex-col ${plan.popular ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border bg-card"}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                    <Star className="h-3 w-3" /> Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && plan.price !== "Free" && <span className="text-muted-foreground text-sm">/month</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? "default" : "outline"} className="w-full">{plan.cta}</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by finance teams</h2>
            <p className="text-muted-foreground">See what our customers say about DelayIQ.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-border bg-card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-xs font-bold text-white">{t.avatar}</div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to predict the future?</h2>
          <p className="text-muted-foreground mb-8">Join 500+ companies using DelayIQ to eliminate payment delays and protect cash flow.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup"><Button size="lg" className="gap-2">Start Free Trial <ArrowRight className="h-4 w-4" /></Button></Link>
            <Button size="lg" variant="outline">Book a Demo</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold">DelayIQ</span>
          </div>
          <p className="text-sm text-muted-foreground">&copy; 2026 DelayIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
