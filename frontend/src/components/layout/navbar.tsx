"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-black px-6">
      {/* Search */}
      <div className="relative w-80 group">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
        <Input
          placeholder="Search invoices, customers…"
          className="pl-10 h-9 text-sm"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 items-center rounded border border-border bg-white/[0.03] px-1.5 font-mono text-[10px] text-muted-foreground/40">
          ⌘K
        </kbd>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative rounded-md p-2 text-muted-foreground hover:bg-white/[0.04] hover:text-white transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        </button>

        <button className="flex items-center gap-2.5 rounded-md py-1.5 px-2.5 hover:bg-white/[0.04] transition-all group">
          <div className="relative">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-[10px] font-bold text-white">
              AC
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-black" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium leading-tight">Aditya C.</div>
            <div className="font-mono text-[10px] text-muted-foreground">Admin</div>
          </div>
        </button>
      </div>
    </header>
  );
}
