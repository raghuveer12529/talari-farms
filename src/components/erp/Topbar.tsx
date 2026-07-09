'use client';

import { Search } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

/** Desktop top bar: global search stub + theme toggle. */
export function Topbar() {
  return (
    <div className="hidden items-center justify-between gap-4 border-b border-border bg-background/60 px-6 py-3 backdrop-blur-sm lg:flex">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search customers, invoices, products…"
          className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          aria-label="Global search"
        />
      </div>
      <ThemeToggle />
    </div>
  );
}
