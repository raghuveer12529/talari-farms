'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    ListOrdered,
    IndianRupee,
    User as UserIcon,
    Users2,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';

type NavItem = {
    label: string;
    href: string;
    icon: any;
    roles: string[];
};

type Props = {
    role: string | undefined;
};

export default function AdminSidebar({ role }: Props) {
    const pathname = usePathname();

    const navItems: NavItem[] = [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['ADMIN', 'PARTNER'] },
        { label: 'Users', href: '/admin/users', icon: UserIcon, roles: ['ADMIN'] },
        { label: 'Partners', href: '/admin/partners', icon: Users2, roles: ['ADMIN'] },
        { label: 'Expenses', href: '/admin/expenses', icon: IndianRupee, roles: ['ADMIN', 'PARTNER'] },
        { label: 'Products', href: '/admin/products', icon: ShoppingBag, roles: ['ADMIN'] },
        { label: 'Orders', href: '/admin/orders', icon: ListOrdered, roles: ['ADMIN'] },
    ];

    const filteredItems = navItems.filter(item => !role || item.roles.includes(role));
    const currentPage = filteredItems.find(item => item.href === pathname);

    return (
        <>
            {/* Mobile: Breadcrumb only (no hamburger — main Navbar handles that) */}
            <div className="md:hidden bg-stone-50 border-b border-stone-200/60 px-4 py-2.5 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Admin</span>
                {currentPage && (
                    <>
                        <ChevronRight size={10} className="text-stone-300" />
                        <span className="text-xs font-bold text-primary">{currentPage.label}</span>
                    </>
                )}
            </div>

            {/* Desktop: Sticky sidebar */}
            <aside className="hidden md:block sticky top-0 h-screen w-64 bg-white border-r border-stone-200 p-6 shrink-0">
                <div className="flex flex-col mb-8">
                    <span className="font-bold text-xl text-primary">Talari Farms</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Admin Portal</span>
                </div>

                <nav className="space-y-1">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                                    ${isActive
                                        ? 'bg-emerald-50 text-emerald-800'
                                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}
                                `}
                            >
                                <item.icon size={18} className={isActive ? 'text-emerald-600' : 'text-stone-400'} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <div className="text-xs text-stone-400 text-center mb-2">Logged in as {role}</div>
                </div>
            </aside>
        </>
    );
}
