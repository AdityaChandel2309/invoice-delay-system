"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  Brain,
  Settings,
  CreditCard,
  Zap,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { label: "Predictions", href: "/dashboard/predictions", icon: Brain },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-black flex flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight">DelayIQ</span>
          <span className="font-mono text-[10px] text-primary border border-primary/30 px-1.5 py-0.5 rounded">PRO</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-5 overflow-y-auto">
        <div className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50">
          Main
        </div>
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200",
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-md bg-white/[0.05] border border-border"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="sidebar-bar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-sm bg-primary"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <item.icon className={cn(
                "h-4 w-4 relative z-10 transition-colors",
                isActive ? "text-primary" : "group-hover:text-white"
              )} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}

        <div className="mb-3 mt-8 px-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50">
          Account
        </div>
        {navItems.slice(4).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200",
                isActive
                  ? "text-white bg-white/[0.05] border border-border"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-sm bg-primary" />
              )}
              <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom card */}
      <div className="border-t border-border p-4">
        <div className="rounded-lg border border-border bg-white/[0.02] p-3.5 corner-dots">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[10px] text-primary">PRO PLAN</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2.5">
            10,000 predictions/mo
          </p>
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: "72%" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
            />
          </div>
          <p className="font-mono text-[10px] text-muted-foreground mt-1.5">7,200 / 10,000</p>
        </div>
      </div>
    </aside>
  );
}
