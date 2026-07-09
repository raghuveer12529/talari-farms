'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  BookOpen,
  Landmark,
  Scale,
  Users,
  LogOut,
  Menu,
  X,
  Leaf,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/ledger', icon: LayoutDashboard },
  { label: 'Entries', href: '/ledger/entries', icon: BookOpen },
  { label: 'Loans', href: '/ledger/loans', icon: Landmark },
  { label: 'Settlement', href: '/ledger/settlement', icon: Scale },
];

const adminItems = [{ label: 'Partners', href: '/ledger/admin', icon: Users }];

interface Props {
  role: 'ADMIN' | 'PARTNER';
  userName: string;
}

export default function LedgerSidebar({ role, userName }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = role === 'ADMIN' ? [...navItems, ...adminItems] : navItems;

  const NavLink = ({ item }: { item: (typeof items)[0] }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
          isActive
            ? 'bg-gradient-hero text-white shadow-soft'
            : 'text-foreground/70 hover:text-foreground hover:bg-primary/5'
        }`}
      >
        <Icon size={18} />
        {item.label}
      </Link>
    );
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 mb-2">
        <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary/10 relative flex-shrink-0">
          <Image src="/logo-lovable.png" alt="Talari Farms" fill className="object-cover" sizes="36px" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-wide text-foreground">TALARI FARMS</span>
          <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Ledger</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {items.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* User + signout */}
      <div className="px-3 py-4 border-t border-border/40 mt-4">
        <div className="glass-card rounded-2xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center flex-shrink-0">
            <Leaf size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{userName}</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{role}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/ledger/login' })}
            className="text-muted-foreground hover:text-red-500 transition-colors"
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
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-gradient-warm border-r border-border/40 fixed left-0 top-0 z-40">
        {sidebar}
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-primary/10 relative">
            <Image src="/logo-lovable.png" alt="Talari Farms" fill className="object-cover" sizes="32px" />
          </div>
          <span className="text-sm font-bold tracking-wide text-foreground">TALARI FARMS LEDGER</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-muted text-foreground"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/90 backdrop-blur-xl pt-16 px-4">
          <div className="glass-card rounded-3xl p-4">{sidebar}</div>
        </div>
      )}
    </>
  );
}
