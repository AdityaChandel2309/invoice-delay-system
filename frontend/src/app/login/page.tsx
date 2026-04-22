"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowLeft, Brain, ShieldCheck, BarChart3 } from "lucide-react";

const floatingIcons = [
  { icon: Brain, x: "15%", y: "20%", delay: 0, size: "h-5 w-5" },
  { icon: ShieldCheck, x: "75%", y: "30%", delay: 1.5, size: "h-4 w-4" },
  { icon: BarChart3, x: "25%", y: "70%", delay: 3, size: "h-4 w-4" },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden aurora-bg">
        <div className="absolute inset-0 dot-pattern" />
        {/* Floating icons */}
        {floatingIcons.map((fi, i) => (
          <motion.div
            key={i}
            className="absolute opacity-[0.15]"
            style={{ left: fi.x, top: fi.y }}
            animate={{ y: [-8, 8, -8], rotate: [-5, 5, -5] }}
            transition={{ duration: 4, delay: fi.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            <fi.icon className={`${fi.size} text-primary`} />
          </motion.div>
        ))}
        <div className="relative text-center max-w-md">
          <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-[#7c5cfc] to-[#38bdf8] flex items-center justify-center shadow-2xl shadow-primary/30 mx-auto mb-8">
            <Zap className="h-8 w-8 text-white" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#7c5cfc] to-[#38bdf8] opacity-40 blur-xl -z-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Welcome back to<br /><span className="gradient-text">DelayIQ</span></h2>
          <p className="text-muted-foreground/60">Predict invoice payment delays with AI. Protect your cash flow.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: "easeOut" }} className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-foreground mb-8 transition-colors duration-200">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground/60 mb-8">Enter your credentials to access your dashboard.</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input type="email" placeholder="you@company.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground/70">
                <input type="checkbox" className="rounded border-border bg-white/[0.02] accent-primary" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
            </div>
            <Link href="/dashboard"><Button className="w-full" size="lg">Sign in</Button></Link>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-muted-foreground/40">or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M11.4 24H0V12.6L11.4 0H24v11.4L12.6 24H11.4z" fill="none"/><path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zm0 12.623H24V24H12.623zM0 12.623h11.377V24H0z" fill="currentColor"/></svg>
              Microsoft
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground/50">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
