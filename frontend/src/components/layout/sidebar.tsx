"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Brain, BarChart3, Settings, CreditCard, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem { label: string; href: string; icon: React.ComponentType<{ className?: string }>; }
interface NavGroup { label: string; items: NavItem[]; }

const navGroups: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
      { label: "Customers", href: "/dashboard/customers", icon: Users },
      { label: "Predictions", href: "/dashboard/predictions", icon: Brain },
    ],
  },
  {
    label: "Intelligence",
    items: [{ label: "Reports", href: "/dashboard/billing", icon: BarChart3 }],
  },
  {
    label: "Admin",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

interface SidebarProps { onNavigate?: () => void; }

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const isActive = (href: string) => pathname === href;
  const toggleGroup = (label: string) => setCollapsed((p) => ({ ...p, [label]: !p[label] }));

  return (
    <nav className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 px-5">
        <Zap className="h-5 w-5 text-sidebar-primary" />
        <span className="text-lg font-semibold tracking-tight text-sidebar-primary-foreground">
          DelayIQ
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {navGroups.map((group, idx) => {
          const isCollapsed = collapsed[group.label] ?? false;
          return (
            <div key={group.label}>
              {idx > 0 && <div className="mx-2 my-2 border-t border-sidebar-border" />}
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center gap-1 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors"
              >
                <ChevronRight className={cn("h-3 w-3 transition-transform", !isCollapsed && "rotate-90")} />
                {group.label}
              </button>
              {!isCollapsed && (
                <div className="mt-0.5 space-y-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive(item.href)
                          ? "bg-sidebar-accent font-medium text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
