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
    LogOut
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
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navItems: NavItem[] = [
        { label: 'Overview', href: '/admin', icon: LayoutDashboard, roles: ['ADMIN', 'PARTNER'] },
        { label: 'Users', href: '/admin/users', icon: UserIcon, roles: ['ADMIN'] },
        { label: 'Partners', href: '/admin/partners', icon: Users2, roles: ['ADMIN'] },
        { label: 'Expenses', href: '/admin/expenses', icon: IndianRupee, roles: ['ADMIN', 'PARTNER'] },
        { label: 'Products', href: '/admin/products', icon: ShoppingBag, roles: ['ADMIN'] },
        { label: 'Orders', href: '/admin/orders', icon: ListOrdered, roles: ['ADMIN'] },
    ];

    const filteredItems = navItems.filter(item => !role || item.roles.includes(role));

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-stone-200 p-4 flex justify-between items-center sticky top-0 z-20">
                <span className="font-bold text-lg text-primary">Farm Admin</span>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 hover:bg-stone-50 rounded-lg text-stone-600"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-stone-200 
                p-6 z-40 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-col">
                        <span className="font-bold text-xl text-primary">Talari Farms</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Admin Portal</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden p-2 hover:bg-stone-50 rounded-lg text-stone-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="space-y-1">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
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
                    <form action={async () => {
                        // In a real app we'd call signOut() here, but for now just redirect or let generic auth handle it
                        // For client component, we rely on standard auth flow. 
                        // Since we are inside layout, we can just show a button or link.
                    }}>
                        <div className="text-xs text-stone-400 text-center mb-2">Logged in as {role}</div>
                    </form>
                </div>
            </aside>
        </>
    );
}
