'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        category: 'Vegetables',
        image: '',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const res = await fetch('/api/products');
        const json = await res.json();
        setProducts(json);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/products', {
            method: 'POST',
            body: JSON.stringify(formData),
        });
        if (res.ok) {
            setShowForm(false);
            setFormData({
                name: '',
                description: '',
                price: '',
                quantity: '',
                category: 'Vegetables',
                image: '',
            });
            fetchProducts();
        }
    };

    if (loading && products.length === 0) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary" size={40} /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Product Management</h1>
                    <p className="text-stone-500">Add and manage your farm produce</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} /> Add Product
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-8 rounded-2xl border border-emerald-200 shadow-xl animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-stone-900">
                        New Product
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-stone-700">Product Name</label>
                            <input
                                required
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                placeholder="e.g. Organic Carrots"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-stone-700">Category</label>
                            <select
                                required
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="Vegetables">Vegetables</option>
                                <option value="Fruits">Fruits</option>
                                <option value="Dairy">Dairy</option>
                                <option value="Grains">Grains</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-stone-700">Price (₹)</label>
                            <input
                                required
                                type="number"
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-stone-700">Quantity Available</label>
                            <input
                                required
                                type="number"
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                placeholder="e.g. 50"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-stone-700">Description</label>
                            <textarea
                                required
                                rows={3}
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Describe the product..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-stone-700">Product Image</label>
                            <ImageUpload
                                value={formData.image}
                                onChange={(url) => setFormData({ ...formData, image: url })}
                                onRemove={() => setFormData({ ...formData, image: '' })}
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-4">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 font-medium text-stone-500 hover:text-stone-700">Cancel</button>
                            <button type="submit" className="btn-primary px-10">Create Product</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded-xl border border-stone-200 flex items-center gap-6 group hover:border-primary transition-all shadow-sm">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-stone-900">{product.name}</h3>
                            <p className="text-sm text-stone-500 line-clamp-1">{product.description}</p>
                            <div className="flex gap-4 mt-2">
                                <span className="text-xs font-bold bg-stone-100 px-2 py-0.5 rounded text-stone-600 uppercase tracking-tighter">{product.category}</span>
                                <span className="text-xs font-bold text-primary">₹{product.price}</span>
                                <span className="text-xs text-stone-400">Stock: {product.quantity}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={20} /></button>
                            <button className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={20} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
