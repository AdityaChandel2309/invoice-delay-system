"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Zap, Brain, ShieldCheck, BarChart3, ArrowRight, CheckCircle2,
  TrendingUp, Users, FileText, Star, ChevronRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const } }),
};

const features = [
  { num: "01", icon: Brain, title: "AI-Powered Predictions", desc: "XGBoost models predict payment delays with 92% accuracy before they happen." },
  { num: "02", icon: ShieldCheck, title: "Risk Scoring", desc: "Automated customer risk tiers — LOW, MEDIUM, HIGH, CRITICAL — updated in real-time." },
  { num: "03", icon: BarChart3, title: "Executive Dashboards", desc: "KPIs, aging buckets, trend analysis, and drill-down reports at a glance." },
  { num: "04", icon: TrendingUp, title: "Trend Analysis", desc: "Monthly delay trends by region, industry, and category with forecasting." },
  { num: "05", icon: Users, title: "Customer Intelligence", desc: "Deep customer profiles with payment history, risk factors, and invoice analytics." },
  { num: "06", icon: FileText, title: "Invoice Explorer", desc: "Search, filter, and analyze every invoice with real-time prediction overlays." },
];

const plans = [
  { name: "Starter", price: "Free", desc: "For small teams getting started", features: ["500 invoices/mo", "Basic predictions", "Email alerts", "1 user"], cta: "Get Started" },
  { name: "Pro", price: "$99", desc: "For growing finance teams", features: ["10,000 invoices/mo", "Advanced ML models", "Risk scoring", "API access", "5 users", "Priority support"], cta: "Start Free Trial", popular: true },
  { name: "Enterprise", price: "Custom", desc: "For large organizations", features: ["Unlimited invoices", "Custom models", "SSO & SAML", "Dedicated CSM", "SLA guarantee", "On-premise option"], cta: "Contact Sales" },
];

const testimonials = [
  { name: "Sarah Chen", role: "CFO, TechFlow Inc.", quote: "DelayIQ reduced our late payments by 42% in the first quarter. The AI predictions are remarkably accurate." },
  { name: "Marcus Johnson", role: "AR Manager, GlobalShip", quote: "We saved $2.1M in late fees last year. The risk scoring helps us prioritize collections perfectly." },
  { name: "Elena Rodriguez", role: "Finance Director, MedSupply Co.", quote: "The dashboard gives our team complete visibility. We catch problems before they become crises." },
];

function AnimatedStat({ value, label, num }: { value: string; label: string; num: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="font-mono text-[10px] text-primary mb-2">{num}</div>
      <div className="text-4xl md:text-5xl font-bold heading-tight mono-data">{value}</div>
      <div className="text-sm text-muted-foreground mt-2">{label}</div>
    </motion.div>
  );
}

/* Corner dot decorator for cards */
function CornerDots({ className = "" }: { className?: string }) {
  return (
    <>
      <div className={`absolute w-1 h-1 bg-white/15 ${className}`} style={{ top: -1, left: -1 }} />
      <div className={`absolute w-1 h-1 bg-white/15 ${className}`} style={{ top: -1, right: -1 }} />
      <div className={`absolute w-1 h-1 bg-white/15 ${className}`} style={{ bottom: -1, left: -1 }} />
      <div className={`absolute w-1 h-1 bg-white/15 ${className}`} style={{ bottom: -1, right: -1 }} />
    </>
  );
}

function CornerDotsLight() {
  return (
    <>
      <div className="absolute w-1 h-1 bg-black/15" style={{ top: -1, left: -1 }} />
      <div className="absolute w-1 h-1 bg-black/15" style={{ top: -1, right: -1 }} />
      <div className="absolute w-1 h-1 bg-black/15" style={{ bottom: -1, left: -1 }} />
      <div className="absolute w-1 h-1 bg-black/15" style={{ bottom: -1, right: -1 }} />
    </>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-black/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">DelayIQ</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-white transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link href="/signup"><Button size="sm">Start Free Trial</Button></Link>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO — Pure Black + Blue Vignette ═══════════ */}
      <section className="relative pt-32 pb-28 px-6 overflow-hidden vignette-blue">
        <div className="absolute inset-0 blueprint-grid" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-4 py-1.5 font-mono text-xs text-primary mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              AI-Powered Payment Intelligence
            </div>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-6xl md:text-8xl font-bold heading-tight mb-6">
            Predict invoice delays<br />before they happen
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            DelayIQ uses machine learning to predict which invoices will be paid late, score customer risk, and give your finance team the intelligence to act proactively.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex items-center justify-center gap-4">
            <Link href="/signup"><Button size="lg" className="gap-2 text-base">Start Free Trial <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/dashboard"><Button size="lg" variant="outline" className="gap-2 text-base">View Demo <ChevronRight className="h-4 w-4" /></Button></Link>
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="flex items-center justify-center gap-8 mt-12">
            {["No credit card required", "14-day free trial", "Cancel anytime"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ STATS — Monospace Numbers ═══════════ */}
      <section className="py-24 border-y border-border relative">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          <AnimatedStat num="01" value="92%" label="Prediction Accuracy" />
          <AnimatedStat num="02" value="42%" label="Fewer Late Payments" />
          <AnimatedStat num="03" value="$2.1M" label="Avg. Annual Savings" />
          <AnimatedStat num="04" value="500+" label="Companies Trust Us" />
        </div>
      </section>

      {/* ═══════════ FEATURES — Numbered Grid + Corner Dots ═══════════ */}
      <section id="features" className="py-28 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="font-mono text-xs text-primary mb-4">CAPABILITIES</div>
              <h2 className="text-4xl md:text-6xl font-bold heading-tight mb-5">
                Everything you need to<br />eliminate payment delays
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">Built for modern finance teams who want to move from reactive collections to proactive cash flow management.</p>
            </motion.div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="relative bg-black p-8 group hover:bg-white/[0.02] transition-colors duration-300"
              >
                <CornerDots />
                <div className="font-mono text-xs text-primary mb-5">{f.num}</div>
                <div className="h-10 w-10 rounded-md border border-border bg-white/[0.03] flex items-center justify-center mb-5 group-hover:border-primary/30 transition-colors">
                  <f.icon className="h-5 w-5 text-white/70" />
                </div>
                <h3 className="text-lg font-semibold mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING — Light Section (contrast flip) ═══════════ */}
      <section id="pricing" className="py-28 px-6 section-light">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="font-mono text-xs text-primary mb-4">PRICING</div>
              <h2 className="text-4xl md:text-6xl font-bold heading-tight mb-5 text-[#0a0a0a]">Simple, transparent pricing</h2>
              <p className="text-[#666] text-lg">Start free. Upgrade when you&apos;re ready.</p>
            </motion.div>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-black/[0.08]">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 flex flex-col ${
                  plan.popular
                    ? "bg-[#0a0a0a] text-white"
                    : "bg-white"
                }`}
              >
                {plan.popular && <CornerDots />}
                {!plan.popular && <CornerDotsLight />}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1 font-mono text-[10px] font-semibold text-white uppercase tracking-wider">
                    <Star className="h-3 w-3" /> Popular
                  </div>
                )}
                <div className="font-mono text-xs text-primary mb-4">{`0${i + 1}`}</div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-4xl font-bold tracking-tight mono-data">{plan.price}</span>
                  {plan.price !== "Custom" && plan.price !== "Free" && <span className={`text-sm ${plan.popular ? "text-white/50" : "text-[#666]"}`}>/month</span>}
                </div>
                <p className={`text-sm mb-7 ${plan.popular ? "text-white/50" : "text-[#666]"}`}>{plan.desc}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.popular ? "text-primary" : "text-primary"}`} />
                      <span className={plan.popular ? "text-white/70" : "text-[#666]"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? "default" : "outline"} className={`w-full ${!plan.popular ? "text-[#0a0a0a] border-black/20 hover:bg-black/5" : ""}`}>{plan.cta}</Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS — Back to Black ═══════════ */}
      <section id="testimonials" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="font-mono text-xs text-primary mb-4">TESTIMONIALS</div>
              <h2 className="text-4xl md:text-6xl font-bold heading-tight mb-5">Loved by finance teams</h2>
              <p className="text-muted-foreground text-lg">See what our customers say about DelayIQ.</p>
            </motion.div>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-border">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-black p-8"
              >
                <CornerDots />
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-primary text-primary" />)}
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="dotted-divider mb-4" />
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative border border-border p-16 vignette-blue"
        >
          <CornerDots />
          <div className="absolute inset-0 blueprint-grid" />
          <div className="relative">
            <div className="font-mono text-xs text-primary mb-4">GET STARTED</div>
            <h2 className="text-4xl md:text-5xl font-bold heading-tight mb-4">Ready to predict the future?</h2>
            <p className="text-muted-foreground mb-10 text-lg">Join 500+ companies using DelayIQ to eliminate payment delays.</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/signup"><Button size="lg" className="gap-2 text-base">Start Free Trial <ArrowRight className="h-4 w-4" /></Button></Link>
              <Button size="lg" variant="outline">Book a Demo</Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">DelayIQ</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="font-mono text-[11px] text-muted-foreground hover:text-white transition-colors uppercase tracking-wider">Privacy</a>
            <a href="#" className="font-mono text-[11px] text-muted-foreground hover:text-white transition-colors uppercase tracking-wider">Terms</a>
            <a href="#" className="font-mono text-[11px] text-muted-foreground hover:text-white transition-colors uppercase tracking-wider">Docs</a>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">&copy; 2026 DelayIQ</p>
        </div>
      </footer>
    </div>
  );
}
