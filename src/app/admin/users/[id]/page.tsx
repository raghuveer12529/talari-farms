'use client';

import { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    TrendingUp,
    ShoppingBag,
    CreditCard,
    Calendar,
    ChevronDown,
    ExternalLink,
    Package,
    IndianRupee,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface LastOrder {
    id: string;
    createdAt: string;
    total: number;
    status: string;
    items: OrderItem[];
}

interface UserStats {
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    firstOrderDate: string | null;
    lastOrderDate: string | null;
    lastOrder: LastOrder | null;
}

interface OrderHistory {
    id: string;
    createdAt: string;
    total: number;
    status: string;
    _count: { items: number };
}

export default function UserDetailsPage() {
    const params = useParams();
    const userId = params.id as string;

    const [stats, setStats] = useState<UserStats | null>(null);
    const [orders, setOrders] = useState<OrderHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsRes, ordersRes] = await Promise.all([
                    fetch(`/api/users/${userId}/stats`),
                    fetch(`/api/users/${userId}/orders`)
                ]);

                const statsData = await statsRes.json();
                const ordersData = await ordersRes.json();

                if (statsData.error) {
                    console.error('Stats API error:', statsData.error);
                } else {
                    setStats(statsData);
                }

                if (ordersData.error) {
                    console.error('Orders API error:', ordersData.error);
                } else {
                    setOrders(ordersData.orders || []);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
                setOrdersLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount || 0);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return 'N/A';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'PACKED': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'PLACED': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-stone-100 text-stone-700 border-stone-200';
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse p-6">
                <div className="h-8 bg-stone-200 rounded-lg w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-stone-100 rounded-2xl border border-stone-200"></div>
                    ))}
                </div>
                <div className="h-64 bg-stone-100 rounded-2xl border border-stone-200"></div>
            </div>
        );
    }

    if (!stats || (stats as any).error) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading User Details</h2>
                <p className="text-secondary mb-6">{(stats as any)?.error || 'User statistics could not be retrieved.'}</p>
                <Link href="/admin/users" className="text-emerald-600 font-bold hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft size={18} /> Back to Users List
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/users"
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors text-secondary"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-primary">User Details</h1>
                    <p className="text-secondary text-sm">Comprehensive overview of customer activity and value.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<ShoppingBag className="text-blue-600" />}
                    label="Total Orders"
                    value={stats.totalOrders.toString()}
                    trend="Lifetime"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    icon={<IndianRupee className="text-emerald-600" />}
                    label="Lifetime Spend"
                    value={formatCurrency(stats.totalSpent)}
                    trend="Gross Revenue"
                    bgColor="bg-emerald-50"
                />
                <StatCard
                    icon={<TrendingUp className="text-purple-600" />}
                    label="Avg. Order Value"
                    value={formatCurrency(stats.avgOrderValue)}
                    trend="Per Purchase"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    icon={<Clock className="text-amber-600" />}
                    label="Last Activity"
                    value={stats.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString() : 'Never'}
                    trend="Recent Order"
                    bgColor="bg-amber-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Last Order Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-primary/5 shadow-sm overflow-hidden h-fit">
                        <div className="p-6 border-b border-primary/5 bg-stone-50/50">
                            <h3 className="font-bold text-primary flex items-center gap-2">
                                <Package size={18} className="text-secondary" />
                                Last Order Details
                            </h3>
                        </div>
                        <div className="p-6">
                            {stats.lastOrder ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Status</div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(stats.lastOrder.status)}`}>
                                                {stats.lastOrder.status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Total</div>
                                            <div className="text-sm font-bold text-emerald-600">{formatCurrency(stats.lastOrder.total)}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Items</div>
                                        <div className="space-y-3 bg-stone-50 p-3 rounded-xl border border-primary/5">
                                            {stats.lastOrder.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 bg-white border border-primary/10 rounded flex items-center justify-center text-[10px] font-bold">
                                                            {item.quantity}
                                                        </span>
                                                        <span className="font-medium text-primary line-clamp-1">{item.name}</span>
                                                    </div>
                                                    <span className="text-secondary tabular-nums">{formatCurrency(item.price * item.quantity)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-primary/5 flex items-center justify-between">
                                        <div className="text-xs text-secondary">
                                            {formatDate(stats.lastOrder.createdAt)}
                                        </div>
                                        <Link
                                            href={`/admin/orders/${stats.lastOrder.id}`}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            View Order <ExternalLink size={12} />
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-secondary italic text-sm">
                                    No orders placed yet.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-emerald-900 text-emerald-50 rounded-2xl p-6 shadow-lg shadow-emerald-900/10">
                        <div className="flex items-center gap-2 text-emerald-300 mb-2">
                            <TrendingUp size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Contribution</span>
                        </div>
                        <h4 className="text-lg font-bold mb-1">Top Customer Analysis</h4>
                        <p className="text-sm text-emerald-200/80 leading-relaxed">
                            {stats.totalOrders > 5
                                ? "This user is a recurring customer with high loyalty."
                                : "A growing customer with potential for future value."}
                        </p>
                    </div>
                </div>

                {/* Order History Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-primary/5 bg-stone-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-primary flex items-center gap-2">
                                <Clock size={18} className="text-secondary" />
                                Order History
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-stone-50/50 border-b border-primary/5">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Order ID</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary text-center">Items</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Total</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {orders.length > 0 ? (
                                        orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-primary tabular-nums">
                                                    #{order.id.slice(-6).toUpperCase()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-secondary">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center font-medium text-primary">
                                                    {order._count.items}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-emerald-600 tabular-nums">
                                                    {formatCurrency(order.total)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={`/admin/orders/${order.id}`}
                                                        className="p-1.5 hover:bg-white border border-transparent hover:border-primary/10 rounded-lg transition-all inline-block"
                                                    >
                                                        <ExternalLink size={14} className="text-secondary" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-sm text-secondary italic">
                                                No order history found for this user.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, trend, bgColor }: {
    icon: React.ReactNode,
    label: string,
    value: string,
    trend: string,
    bgColor: string
}) {
    return (
        <div className="bg-white rounded-2xl border border-primary/5 p-6 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <div className="space-y-1">
                <div className="text-xs font-bold text-secondary uppercase tracking-widest">{label}</div>
                <div className="text-2xl font-bold text-primary tracking-tight">{value}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-primary/5 flex items-center gap-1 text-[10px] font-bold text-secondary">
                <ChevronRight size={12} className="text-primary/20" />
                {trend}
            </div>
        </div>
    );
}
