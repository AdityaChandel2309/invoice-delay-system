"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative aurora-bg">
      <div className="absolute inset-0 dot-pattern" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: "easeOut" }} className="relative w-full max-w-sm">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-foreground mb-8 transition-colors duration-200">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>

        {!sent ? (
          <>
            <h1 className="text-2xl font-bold mb-1 tracking-tight">Reset password</h1>
            <p className="text-sm text-muted-foreground/60 mb-8">Enter your email and we&apos;ll send you a reset link.</p>
            <div className="space-y-4">
              <div><label className="text-sm font-medium mb-1.5 block">Email</label><Input type="email" placeholder="you@company.com" /></div>
              <Button className="w-full" size="lg" onClick={() => setSent(true)}>Send Reset Link</Button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="relative h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              <div className="absolute inset-0 rounded-full bg-emerald-400/10 animate-ping" />
            </div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Check your email</h1>
            <p className="text-sm text-muted-foreground/60 mb-8">We sent a password reset link to your email address.</p>
            <Button variant="outline" onClick={() => setSent(false)}>Try a different email</Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
