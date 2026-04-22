"use client";

import { useState } from "react";
import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 shadow-sm md:px-8">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>

      <button
        type="button"
        className="flex h-9 flex-1 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 md:max-w-sm"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span>Search invoices, customers…</span>
        <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <button type="button" className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-1 hover:bg-muted transition-colors ml-auto">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          AC
        </div>
        <span className="hidden text-sm font-medium md:inline-block">Aditya C.</span>
      </button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
