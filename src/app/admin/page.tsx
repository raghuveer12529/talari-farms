'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ListOrdered, IndianRupee, Wallet, AlertCircle, Bell } from 'lucide-react';
import SettlementCard from '@/components/admin/SettlementCard';

interface DashboardData {
    productCount: number;
    orderCount: number;
    orderTotal: number;
    walletBalance: number;
    settlements: any[];
    userName: string;
    latestOrderTime: string | null;
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [newOrdersCount, setNewOrdersCount] = useState(0);

    useEffect(() => {
        // Fetch dashboard data
        fetch('/api/admin/dashboard')
            .then(res => res.json())
            .then(setData)
            .catch(err => console.error('Failed to fetch dashboard data:', err));

        // Check for new orders
        const lastViewed = localStorage.getItem('lastViewedOrders');
        fetch('/api/orders')
            .then(res => res.json())
            .then(orders => {
                if (lastViewed) {
                    const newOrders = orders.filter((o: any) => new Date(o.createdAt) > new Date(lastViewed));
                    setNewOrdersCount(newOrders.length);
                }
            })
            .catch(err => console.error('Failed to check new orders:', err));
    }, []);

    if (!data) {
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    const stats = [
        { label: 'Products', value: data.productCount, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Orders', value: data.orderCount, icon: ListOrdered, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Sales', value: `₹${data.orderTotal.toLocaleString()}`, icon: IndianRupee, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Farm Wallet', value: `₹${data.walletBalance.toLocaleString()}`, icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-stone-900 font-serif">Farm Overview</h1>
                    <p className="text-stone-500">Welcome back, {data.userName}</p>
                </div>
                <div className="flex gap-3 text-sm">
                    <Link href="/admin/expenses" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-2">
                        + Expense
                    </Link>
                </div>
            </header>

            {/* NEW ORDERS NOTIFICATION */}
            {newOrdersCount > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <Bell className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                        <h3 className="font-bold text-emerald-800 text-sm">New Order{newOrdersCount > 1 ? 's' : ''} Received! 🎉</h3>
                        <p className="text-sm text-emerald-700 mt-1">
                            You have <span className="font-bold">{newOrdersCount}</span> new order{newOrdersCount > 1 ? 's' : ''} waiting for your attention.
                        </p>
                    </div>
                    <Link
                        href="/admin/orders"
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shrink-0"
                    >
                        View Orders
                    </Link>
                </div>
            )}

            {/* ACTION REQUIRED SECTION */}
            {data.settlements.some(s => s.netBalance < -1) && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-bold text-rose-800 text-sm">Action Required: Settlements Pending</h3>
                        <div className="space-y-1 mt-1">
                            {data.settlements.filter(s => s.netBalance < -1).map(s => (
                                <p key={s.partnerName} className="text-sm text-rose-700">
                                    <span className="font-semibold">{s.partnerName}</span> needs to pay <span className="font-mono font-bold">₹{Math.abs(s.netBalance).toLocaleString()}</span>
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: METRICS (2/3 width on large screens) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* FINANCE SECTION */}
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 px-1">Financial Health</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Farm Wallet */}
                            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Wallet size={80} className="text-purple-600" />
                                </div>
                                <div className="relative z-10">
                                    <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-purple-700">
                                        <Wallet size={20} />
                                    </div>
                                    <p className="text-stone-500 text-sm font-medium">Farm Wallet Balance</p>
                                    <p className="text-3xl font-bold text-stone-900 mt-1 tracking-tight">
                                        ₹{data.walletBalance.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-stone-400 mt-2">Available for expenses</p>
                                </div>
                            </div>

                            {/* Total Sales (Placeholder linkage for now) */}
                            <Link href="/admin/orders" className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <IndianRupee size={80} className="text-amber-600" />
                                </div>
                                <div className="relative z-10">
                                    <div className="bg-amber-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-amber-700">
                                        <IndianRupee size={20} />
                                    </div>
                                    <p className="text-stone-500 text-sm font-medium">Total Sales Revenue</p>
                                    <p className="text-3xl font-bold text-stone-900 mt-1 tracking-tight">
                                        ₹{data.orderTotal.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-stone-400 mt-2">Gross income from orders</p>
                                </div>
                            </Link>
                        </div>
                    </section>

                    {/* OPERATIONS SECTION */}
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 px-1">Operations</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Link href="/admin/products" className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all text-center">
                                <p className="text-2xl font-bold text-stone-900">{data.productCount}</p>
                                <p className="text-xs text-stone-500 font-medium">Active Products</p>
                            </Link>
                            <Link href="/admin/orders" className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all text-center relative">
                                {newOrdersCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                        {newOrdersCount}
                                    </span>
                                )}
                                <p className="text-2xl font-bold text-stone-900">{data.orderCount}</p>
                                <p className="text-xs text-stone-500 font-medium">Total Orders</p>
                            </Link>
                            {/* Placeholders for future stats */}
                            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-center opacity-60">
                                <p className="text-xl font-bold text-stone-400">-</p>
                                <p className="text-xs text-stone-400">Harvests</p>
                            </div>
                            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-center opacity-60">
                                <p className="text-xl font-bold text-stone-400">-</p>
                                <p className="text-xs text-stone-400">Inventory</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: PARTNERS & ACTIONS (1/3 width) */}
                <div className="space-y-8">
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 px-1 flex items-center gap-2">
                            Settlements
                            <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full normal-case tracking-normal">Live</span>
                        </h2>
                        <div className="space-y-3">
                            {data.settlements.map((s) => (
                                <SettlementCard
                                    key={s.partnerName}
                                    partnerName={s.partnerName || 'Unknown Partner'}
                                    netBalance={s.netBalance}
                                    totalPaid={s.totalPaid}
                                    share={s.totalShare}
                                />
                            ))}
                        </div>
                        <p className="text-[10px] text-stone-400 mt-4 leading-relaxed text-center px-4">
                            * Settlements are calculated from personally paid expenses. Wallet expenses do not affect partner debt.
                        </p>
                    </section>

                    <section className="bg-emerald-900 text-emerald-50 p-6 rounded-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-white mb-2 font-serif text-lg">Quick Actions</h3>
                            <div className="space-y-2">
                                <Link href="/admin/expenses" className="block w-full text-center bg-white/10 hover:bg-white/20 border border-white/10 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                                    Manage Expenses
                                </Link>
                                <Link href="/admin/loans" className="block w-full text-center bg-white/10 hover:bg-white/20 border border-white/10 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                                    Loan Book
                                </Link>
                            </div>
                        </div>
                        {/* Decorative circle */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
                    </section>
                </div>
            </div>
        </div>
    );
}
