"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { User, Bell, Palette, Shield, Save } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <PageTransition routeKey="settings">
      <div className="space-y-6 p-4 md:p-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and application preferences.</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">AC</div>
              <div><Button variant="outline" size="sm">Change Avatar</Button></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block text-foreground">First Name</label><Input defaultValue="Aditya" /></div>
              <div><label className="text-sm font-medium mb-1.5 block text-foreground">Last Name</label><Input defaultValue="Chandel" /></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block text-foreground">Email</label><Input defaultValue="adichand2005@gmail.com" type="email" /></div>
            <div><label className="text-sm font-medium mb-1.5 block text-foreground">Company</label><Input defaultValue="DelayIQ" /></div>
          </CardContent>
        </Card>

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
                <span className="text-sm text-foreground">{n.label}</span>
                <div className="relative">
                  <input type="checkbox" defaultChecked={n.defaultChecked} className="sr-only peer" />
                  <div className="w-9 h-5 rounded-full bg-muted peer-checked:bg-primary transition-colors cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-card after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> Appearance</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {[
                { label: "Light", active: true, bg: "bg-background" },
                { label: "Dark", active: false, bg: "bg-sidebar" },
                { label: "System", active: false, bg: "bg-gradient-to-r from-background to-sidebar" },
              ].map((t) => (
                <button key={t.label} className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${t.active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/30"}`}>
                  <div className={`w-16 h-10 rounded-md ${t.bg} border border-border`} />
                  <span className="text-xs font-medium text-foreground">{t.label}</span>
                  {t.active && <Badge>Active</Badge>}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Security</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium mb-1.5 block text-foreground">Current Password</label><Input type="password" placeholder="••••••••" /></div>
            <div><label className="text-sm font-medium mb-1.5 block text-foreground">New Password</label><Input type="password" placeholder="Min 8 characters" /></div>
            <div><label className="text-sm font-medium mb-1.5 block text-foreground">Confirm Password</label><Input type="password" placeholder="Confirm new password" /></div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
          {saved && <span className="text-sm text-status-healthy animate-pulse">✓ Changes saved!</span>}
        </div>
      </div>
    </PageTransition>
  );
}
