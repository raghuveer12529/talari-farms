'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    ArrowUpDown,
    ExternalLink,
    User as UserIcon
} from 'lucide-react';

interface User {
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string | null;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key: keyof User) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedUsers = [...users].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        const aValue = a[key];
        const bValue = b[key];

        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (aValue < bValue) {
            return direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const filteredUsers = sortedUsers.filter(user => {
        const name = user.name?.toLowerCase() || '';
        const email = user.email.toLowerCase();
        const term = searchTerm.toLowerCase();
        return name.includes(term) || email.includes(term);
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Users Management</h1>
                    <p className="text-secondary text-sm">Monitor customer activity and business contribution.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-primary/5 bg-white/50 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-stone-50 border-b border-primary/5">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">User</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('totalOrders')}>
                                    <div className="flex items-center gap-2">
                                        Orders <ArrowUpDown size={14} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('totalSpent')}>
                                    <div className="flex items-center gap-2">
                                        Total Spend <ArrowUpDown size={14} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Last Order</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('createdAt')}>
                                    <div className="flex items-center gap-2">
                                        Joined <ArrowUpDown size={14} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4 h-16 bg-stone-50/50"></td>
                                    </tr>
                                ))
                            ) : paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-stone-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-primary">{user.name || 'Anonymous'}</div>
                                                    <div className="text-xs text-secondary">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-primary">
                                            {user.totalOrders}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-emerald-600">
                                            {formatCurrency(user.totalSpent)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-secondary">
                                            {formatDate(user.lastOrderDate)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-secondary">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-primary/10 rounded-lg text-xs font-bold text-primary hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all shadow-sm"
                                            >
                                                View Details <ExternalLink size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-secondary">
                                        No users found matches your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-6 border-t border-primary/5 flex items-center justify-between bg-stone-50/50">
                        <div className="text-xs font-medium text-secondary">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-primary/10 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="text-sm font-bold text-primary w-8 text-center">{currentPage}</div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-primary/10 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
