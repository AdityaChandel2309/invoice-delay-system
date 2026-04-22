"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Palette, Shield, Save } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button onClick={() => setOn(!on)} className={`relative w-10 h-[22px] rounded-full transition-colors duration-300 ${on ? "bg-primary" : "bg-white/[0.08]"}`}>
      <motion.div className="absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm" animate={{ x: on ? 18 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
    </button>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground/60 mt-0.5">Manage your account and application preferences.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2 tracking-tight"><User className="h-4 w-4 text-primary" /> Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-[#38bdf8] flex items-center justify-center text-xl font-bold text-white ring-2 ring-background">AC</div>
            <Button variant="outline" size="sm">Change Avatar</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1.5 block">First Name</label><Input defaultValue="Aditya" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Last Name</label><Input defaultValue="Chandel" /></div>
          </div>
          <div><label className="text-sm font-medium mb-1.5 block">Email</label><Input defaultValue="adichand2005@gmail.com" type="email" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Company</label><Input defaultValue="DelayIQ" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2 tracking-tight"><Bell className="h-4 w-4 text-primary" /> Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Email alerts for high-risk predictions", defaultChecked: true },
            { label: "Weekly delay summary report", defaultChecked: true },
            { label: "New overdue invoice notifications", defaultChecked: false },
            { label: "Model performance updates", defaultChecked: false },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between py-1">
              <span className="text-sm text-muted-foreground/70">{n.label}</span>
              <Toggle defaultChecked={n.defaultChecked} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2 tracking-tight"><Palette className="h-4 w-4 text-primary" /> Appearance</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[
              { label: "Dark", active: true, bg: "bg-[#0a0a0c]" },
              { label: "Light", active: false, bg: "bg-white" },
              { label: "System", active: false, bg: "bg-gradient-to-r from-[#0a0a0c] to-white" },
            ].map((t) => (
              <button key={t.label} className={`flex flex-col items-center gap-2.5 p-3.5 rounded-xl border transition-all duration-200 ${t.active ? "border-primary/30 bg-primary/[0.04]" : "border-border hover:border-border-hover"}`}>
                <div className={`w-16 h-10 rounded-lg ${t.bg} border border-border`} />
                <span className="text-xs font-medium">{t.label}</span>
                {t.active && <Badge>Active</Badge>}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2 tracking-tight"><Shield className="h-4 w-4 text-primary" /> Security</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-sm font-medium mb-1.5 block">Current Password</label><Input type="password" placeholder="••••••••" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">New Password</label><Input type="password" placeholder="Min 8 characters" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Confirm Password</label><Input type="password" placeholder="Confirm new password" /></div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
        <AnimatePresence>
          {saved && (
            <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="text-sm text-emerald-400">
              ✓ Changes saved!
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
