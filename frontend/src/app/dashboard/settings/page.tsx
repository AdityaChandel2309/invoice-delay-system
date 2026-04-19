"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Palette, Shield, Save } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and application preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-xl font-bold text-white">AC</div>
            <div><Button variant="outline" size="sm">Change Avatar</Button></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1.5 block">First Name</label><Input defaultValue="Aditya" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Last Name</label><Input defaultValue="Chandel" /></div>
          </div>
          <div><label className="text-sm font-medium mb-1.5 block">Email</label><Input defaultValue="adichand2005@gmail.com" type="email" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Company</label><Input defaultValue="DelayIQ" /></div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Email alerts for high-risk predictions", defaultChecked: true },
            { label: "Weekly delay summary report", defaultChecked: true },
            { label: "New overdue invoice notifications", defaultChecked: false },
            { label: "Model performance updates", defaultChecked: false },
          ].map((n) => (
            <label key={n.label} className="flex items-center justify-between py-1">
              <span className="text-sm">{n.label}</span>
              <div className="relative">
                <input type="checkbox" defaultChecked={n.defaultChecked} className="sr-only peer" />
                <div className="w-9 h-5 rounded-full bg-zinc-700 peer-checked:bg-primary transition-colors cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> Appearance</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[
              { label: "Dark", active: true, bg: "bg-zinc-900" },
              { label: "Light", active: false, bg: "bg-white" },
              { label: "System", active: false, bg: "bg-gradient-to-r from-zinc-900 to-white" },
            ].map((t) => (
              <button key={t.label} className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${t.active ? "border-primary bg-primary/5" : "border-border hover:border-zinc-700"}`}>
                <div className={`w-16 h-10 rounded-md ${t.bg} border border-border`} />
                <span className="text-xs font-medium">{t.label}</span>
                {t.active && <Badge>Active</Badge>}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Security</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-sm font-medium mb-1.5 block">Current Password</label><Input type="password" placeholder="••••••••" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">New Password</label><Input type="password" placeholder="Min 8 characters" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Confirm Password</label><Input type="password" placeholder="Confirm new password" /></div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
        {saved && <span className="text-sm text-emerald-400 animate-pulse">✓ Changes saved!</span>}
      </div>
    </div>
  );
}
