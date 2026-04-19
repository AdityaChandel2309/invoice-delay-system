"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-background to-purple-500/10 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative max-w-md">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 mb-8">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-6"><span className="gradient-text">Start predicting</span><br />payment delays today</h2>
          <ul className="space-y-3">
            {["14-day free trial, no credit card", "Setup in under 5 minutes", "Works with any ERP or accounting system", "Cancel anytime"].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />{t}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-8">Start your free 14-day trial.</p>
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
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
