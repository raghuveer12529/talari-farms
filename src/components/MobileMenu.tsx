'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { usePathname } from 'next/navigation';
import {
    Menu,
    X,
    ShoppingBag,
    LayoutDashboard,
    UserIcon,
    Users2,
    ListOrdered,
    IndianRupee,
    LogOut,
    Leaf,
    Sun,
    Phone
} from 'lucide-react';

export default function MobileMenu({ role }: { role?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    // Ensure portal target is available (client-side only)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const adminNavItems = [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Products', href: '/admin/products', icon: ShoppingBag },
        { label: 'Orders', href: '/admin/orders', icon: ListOrdered },
        { label: 'Expenses', href: '/admin/expenses', icon: IndianRupee },
        { label: 'Partners', href: '/admin/partners', icon: Users2 },
        { label: 'Users', href: '/admin/users', icon: UserIcon },
    ];

    // The panel is rendered via portal to escape the navbar's stacking context
    const menuPanel = isOpen && mounted ? createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[998] bg-black/30"
                onClick={() => setIsOpen(false)}
                style={{ top: '64px' }}
            />

            {/* Panel */}
            <div
                className="fixed left-0 right-0 bottom-0 z-[999] overflow-y-auto"
                style={{ top: '64px', backgroundColor: '#ffffff' }}
            >
                {/* Site Navigation — Only for Guests or regular users. Admins see the Admin Panel instead. */}
                {(!role || (role !== 'ADMIN' && role !== 'PARTNER')) && (
                    <div className="px-5 pt-5 pb-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2 px-1">Navigate</div>
                        <nav className="space-y-0.5">
                            <Link
                                href="/"
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-[15px] font-semibold
                                    ${pathname === '/'
                                        ? 'bg-emerald-50 text-emerald-800'
                                        : 'text-stone-700 hover:bg-stone-50 active:bg-stone-100'}
                                `}
                            >
                                <LayoutDashboard size={20} className={pathname === '/' ? 'text-emerald-600' : 'text-stone-400'} />
                                Home
                            </Link>

                            <Link
                                href="/about"
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-[15px] font-semibold
                                    ${pathname === '/about'
                                        ? 'bg-emerald-50 text-emerald-800'
                                        : 'text-stone-700 hover:bg-stone-50 active:bg-stone-100'}
                                `}
                            >
                                <Leaf size={20} className={pathname === '/about' ? 'text-emerald-600' : 'text-stone-400'} />
                                Our Story
                            </Link>

                            <Link
                                href="/why-gac"
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-[15px] font-semibold
                                    ${pathname === '/why-gac'
                                        ? 'bg-orange-50 text-orange-800'
                                        : 'text-stone-700 hover:bg-stone-50 active:bg-stone-100'}
                                `}
                            >
                                <Sun size={20} className={pathname === '/why-gac' ? 'text-orange-600' : 'text-stone-400'} />
                                Why Gac?
                            </Link>

                            <Link
                                href="/products"
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-[15px] font-semibold
                                    ${pathname === '/products'
                                        ? 'bg-emerald-50 text-emerald-800'
                                        : 'text-stone-700 hover:bg-stone-50 active:bg-stone-100'}
                                `}
                            >
                                <ShoppingBag size={20} className={pathname === '/products' ? 'text-emerald-600' : 'text-stone-400'} />
                                Shop Harvest
                            </Link>

                            <Link
                                href="/contact"
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-[15px] font-semibold
                                    ${pathname === '/contact'
                                        ? 'bg-emerald-50 text-emerald-800'
                                        : 'text-stone-700 hover:bg-stone-50 active:bg-stone-100'}
                                `}
                            >
                                <Phone size={20} className={pathname === '/contact' ? 'text-emerald-600' : 'text-stone-400'} />
                                Contact Us
                            </Link>

                            {role === 'CUSTOMER' && (
                                <Link
                                    href="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-[15px] font-semibold
                                        ${pathname === '/profile'
                                            ? 'bg-emerald-50 text-emerald-800'
                                            : 'text-stone-700 hover:bg-stone-50 active:bg-stone-100'}
                                    `}
                                >
                                    <UserIcon size={20} className={pathname === '/profile' ? 'text-emerald-600' : 'text-stone-400'} />
                                    My Profile
                                </Link>
                            )}
                        </nav>
                    </div>
                )}

                {/* Admin Navigation */}
                {(role === 'ADMIN' || role === 'PARTNER') && (
                    <div className="px-5 pb-5">
                        <div className="border-t border-stone-100 pt-4 mb-2">
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 px-1">Admin Panel</div>
                        </div>
                        <nav className="space-y-0.5">
                            {adminNavItems
                                .filter(item => {
                                    if (role === 'PARTNER') {
                                        return ['Overview', 'Expenses'].includes(item.label);
                                    }
                                    return true;
                                })
                                .map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`
                                                flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-[14px] font-medium
                                                ${isActive
                                                    ? 'bg-emerald-50 text-emerald-800'
                                                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700 active:bg-stone-100'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon size={18} className={isActive ? 'text-emerald-600' : 'text-stone-400'} />
                                                {item.label}
                                            </div>
                                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                        </Link>
                                    );
                                })}
                        </nav>
                    </div>
                )}

                {/* Footer */}
                {role && (
                    <div className="px-5 py-4 border-t border-stone-100" style={{ backgroundColor: '#fafafa' }}>
                        <LogoutButton
                            variant="text"
                            onLogout={() => setIsOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium text-stone-500 hover:bg-white hover:text-red-600 transition-all"
                        />
                    </div>
                )}
            </div>
        </>,
        document.body
    ) : null;

    return (
        <div className="md:hidden">
            {/* Trigger Button — rendered inside the navbar */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl text-primary/70 hover:text-primary hover:bg-primary/5 transition-all"
                aria-label="Menu"
            >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Panel — rendered via portal to document.body */}
            {menuPanel}
        </div>
    );
}
