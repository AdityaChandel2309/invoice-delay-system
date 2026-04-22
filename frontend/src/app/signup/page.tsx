"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowLeft, CheckCircle2, Brain, BarChart3, ShieldCheck } from "lucide-react";

const floatingIcons = [
  { icon: Brain, x: "20%", y: "25%", delay: 0 },
  { icon: ShieldCheck, x: "70%", y: "35%", delay: 2 },
  { icon: BarChart3, x: "30%", y: "75%", delay: 3.5 },
];

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden aurora-bg">
        <div className="absolute inset-0 dot-pattern" />
        {floatingIcons.map((fi, i) => (
          <motion.div
            key={i}
            className="absolute opacity-[0.15]"
            style={{ left: fi.x, top: fi.y }}
            animate={{ y: [-8, 8, -8], rotate: [-5, 5, -5] }}
            transition={{ duration: 4, delay: fi.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            <fi.icon className="h-5 w-5 text-primary" />
          </motion.div>
        ))}
        <div className="relative max-w-md">
          <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-[#7c5cfc] to-[#38bdf8] flex items-center justify-center shadow-2xl shadow-primary/30 mb-8">
            <Zap className="h-8 w-8 text-white" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#7c5cfc] to-[#38bdf8] opacity-40 blur-xl -z-10" />
          </div>
          <h2 className="text-3xl font-bold mb-6 tracking-tight"><span className="gradient-text">Start predicting</span><br />payment delays today</h2>
          <ul className="space-y-3.5">
            {["14-day free trial, no credit card", "Setup in under 5 minutes", "Works with any ERP or accounting system", "Cancel anytime"].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-sm text-muted-foreground/60"><CheckCircle2 className="h-4 w-4 text-emerald-400/70 shrink-0" />{t}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: "easeOut" }} className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-foreground mb-8 transition-colors duration-200">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground/60 mb-8">Start your free 14-day trial.</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1.5 block">First name</label><Input placeholder="John" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Last name</label><Input placeholder="Doe" /></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">Work email</label><Input type="email" placeholder="you@company.com" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Company name</label><Input placeholder="Acme Inc." /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Password</label><Input type="password" placeholder="Min 8 characters" /></div>
            <Link href="/dashboard"><Button className="w-full" size="lg">Create Account</Button></Link>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground/50">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
