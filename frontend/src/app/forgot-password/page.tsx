"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-8 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>

        {!sent ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight mb-1 text-foreground">Reset password</h1>
            <p className="text-sm text-muted-foreground mb-8">Enter your email and we&apos;ll send you a reset link.</p>
            <div className="space-y-4">
              <div><label className="text-sm font-medium mb-1.5 block text-foreground">Email</label><Input type="email" placeholder="you@company.com" /></div>
              <Button className="w-full" size="lg" onClick={() => setSent(true)}>Send Reset Link</Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2 text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground mb-6">We sent a password reset link to your email address.</p>
            <Button variant="outline" onClick={() => setSent(false)}>Try a different email</Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
