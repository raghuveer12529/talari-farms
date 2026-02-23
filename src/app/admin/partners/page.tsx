'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit2, Search, X, Loader2 } from 'lucide-react';

interface Partner {
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
    _count: {
        expenses: number;
        loanSplits: number;
        expensePayments: number;
    };
}

export default function PartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/partners');
            if (res.ok) {
                const data = await res.json();
                setPartners(data);
            }
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');

        try {
            const res = await fetch('/api/partners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setShowAddModal(false);
                setFormData({ name: '', email: '', password: '' });
                fetchPartners();
            } else {
                setFormError(data.error || 'Failed to add partner');
            }
        } catch (error) {
            setFormError('An error occurred');
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPartner) return;

        setFormLoading(true);
        setFormError('');

        try {
            const res = await fetch(`/api/partners/${selectedPartner.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    ...(formData.password && { password: formData.password })
                })
            });

            const data = await res.json();

            if (res.ok) {
                setShowEditModal(false);
                setSelectedPartner(null);
                setFormData({ name: '', email: '', password: '' });
                fetchPartners();
            } else {
                setFormError(data.error || 'Failed to update partner');
            }
        } catch (error) {
            setFormError('An error occurred');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeletePartner = async (id: string) => {
        try {
            const res = await fetch(`/api/partners/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setDeleteConfirm(null);
                fetchPartners();
            }
        } catch (error) {
            console.error('Error deleting partner:', error);
        }
    };

    const openEditModal = (partner: Partner) => {
        setSelectedPartner(partner);
        setFormData({
            name: partner.name || '',
            email: partner.email,
            password: ''
        });
        setFormError('');
        setShowEditModal(true);
    };

    const openAddModal = () => {
        setFormData({ name: '', email: '', password: '' });
        setFormError('');
        setShowAddModal(true);
    };

    const filteredPartners = partners.filter(partner => {
        const name = partner.name?.toLowerCase() || '';
        const email = partner.email.toLowerCase();
        const term = searchTerm.toLowerCase();
        return name.includes(term) || email.includes(term);
    });

    const formatDate = (dateString: string) => {
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
                    <h1 className="text-2xl font-bold text-primary">Partner Management</h1>
                    <p className="text-secondary text-sm">Manage farm partners and their access.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="btn-apple btn-apple-primary px-6 py-3 flex items-center gap-2"
                >
                    <Plus size={18} /> Add Partner
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-primary/5 bg-white/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                        <input
                            type="text"
                            placeholder="Search partners by name or email..."
                            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-stone-50 border-b border-primary/5">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Partner</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Expenses</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Loan Splits</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Joined</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4 h-16 bg-stone-50/50"></td>
                                    </tr>
                                ))
                            ) : filteredPartners.length > 0 ? (
                                filteredPartners.map((partner) => (
                                    <tr key={partner.id} className="hover:bg-stone-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                                    {partner.name ? partner.name[0].toUpperCase() : partner.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-primary">{partner.name || 'No Name'}</div>
                                                    <div className="text-xs text-secondary">{partner.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-primary">
                                            {partner._count.expenses}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-primary">
                                            {partner._count.loanSplits}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-secondary">
                                            {formatDate(partner.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(partner)}
                                                    className="p-2 text-primary hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Edit partner"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {deleteConfirm === partner.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDeletePartner(partner.id)}
                                                            className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(partner.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete partner"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-secondary">
                                        No partners found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Partner Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-primary">Add New Partner</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-secondary hover:text-primary">
                                <X size={24} />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleAddPartner} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-3 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full p-3 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Password</label>
                                <input
                                    required
                                    type="password"
                                    className="w-full p-3 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    minLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="btn-apple btn-apple-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {formLoading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                {formLoading ? 'Adding...' : 'Add Partner'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Partner Modal */}
            {showEditModal && selectedPartner && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-primary">Edit Partner</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-secondary hover:text-primary">
                                <X size={24} />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleEditPartner} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-3 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full p-3 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-primary/60 mb-2">
                                    New Password <span className="text-xs text-secondary">(leave blank to keep current)</span>
                                </label>
                                <input
                                    type="password"
                                    className="w-full p-3 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    minLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="btn-apple btn-apple-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {formLoading ? <Loader2 className="animate-spin" size={18} /> : <Edit2 size={18} />}
                                {formLoading ? 'Updating...' : 'Update Partner'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
