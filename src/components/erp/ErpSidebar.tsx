'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  Wallet,
  Settings,
  ScrollText,
  FileSpreadsheet,
  Truck,
  ShoppingCart,
  Factory,
  Receipt,
  PiggyBank,
  BarChart3,
  LineChart,
  LogOut,
  Menu,
  X,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Role, ROLE_LABELS } from '@/lib/permissions';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { label: 'Customers', href: '/app/customers', icon: Users },
  { label: 'Products', href: '/app/products', icon: Package },
  { label: 'Inventory', href: '/app/inventory', icon: Boxes },
  { label: 'Invoices', href: '/app/invoices', icon: FileText },
  { label: 'Payments', href: '/app/payments', icon: Wallet },
];

const comingSoon: NavItem[] = [
  { label: 'Quotations', href: '#', icon: FileSpreadsheet },
  { label: 'Delivery Challans', href: '#', icon: Truck },
  { label: 'Purchase Orders', href: '#', icon: ShoppingCart },
  { label: 'Suppliers', href: '#', icon: Factory },
  { label: 'Receipts', href: '#', icon: Receipt },
  { label: 'Expenses', href: '#', icon: PiggyBank },
  { label: 'Reports', href: '#', icon: BarChart3 },
  { label: 'Analytics', href: '#', icon: LineChart },
];

const settingsNav: NavItem[] = [{ label: 'Settings', href: '/app/settings', icon: Settings }];
const adminNav: NavItem[] = [{ label: 'Audit Log', href: '/app/audit', icon: ScrollText }];

interface Props {
  role: Role;
  userName: string;
}

export default function ErpSidebar({ role, userName }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/app' ? pathname === '/app' : pathname.startsWith(href);

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all',
          active
            ? 'bg-primary text-primary-foreground shadow-soft'
            : 'text-foreground/70 hover:bg-primary/5 hover:text-foreground',
        )}
      >
        <Icon size={18} />
        {item.label}
      </Link>
    );
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="mb-2 flex items-center gap-3 px-4 py-6">
        <div className="relative size-9 flex-shrink-0 overflow-hidden rounded-xl bg-primary/10">
          <Image src="/logo-lovable.png" alt="Talari Farms" fill className="object-cover" sizes="36px" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-wide text-foreground">TALARI FARMS</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            ERP
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        {mainNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        <div className="mt-2 px-3.5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Settings
        </div>
        {settingsNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        {role === 'ADMIN' && adminNav.map((item) => <NavLink key={item.href} item={item} />)}

        <div className="mt-2 px-3.5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Coming soon
        </div>
        {comingSoon.map((item) => {
          const Icon = item.icon;
          return (
            <span
              key={item.label}
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground/35"
              title="Coming in a future release"
            >
              <Icon size={18} />
              {item.label}
              <Lock size={12} className="ml-auto" />
            </span>
          );
        })}
      </nav>

      {/* User + signout */}
      <div className="mt-4 border-t border-border/60 px-3 py-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {userName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{userName}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {ROLE_LABELS[role]}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/ledger/login' })}
            className="text-muted-foreground transition-colors hover:text-red-500"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden min-h-screen w-64 flex-col border-r border-border bg-card lg:flex">
        {sidebar}
      </aside>

      {/* Mobile header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="relative size-8 overflow-hidden rounded-xl bg-primary/10">
            <Image src="/logo-lovable.png" alt="Talari Farms" fill className="object-cover" sizes="32px" />
          </div>
          <span className="text-sm font-bold tracking-wide text-foreground">TALARI FARMS ERP</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-background/95 px-4 pt-16 backdrop-blur-xl lg:hidden">
          <div className="rounded-3xl border border-border bg-card p-2">{sidebar}</div>
        </div>
      )}
    </>
  );
}
