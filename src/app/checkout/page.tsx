'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function CheckoutPage() {
    const router = useRouter();
    const { items: cart, total, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        streetAddress: '',
        city: '',
        state: '',
        pinCode: '',
    });

    useEffect(() => {
        if (cart.length === 0 && !isSuccess) {
            router.push('/products');
            return;
        }

        // Fetch user session and auto-populate form
        fetch('/api/auth/session')
            .then(res => res.json())
            .then(session => {
                if (session?.user) {
                    setFormData(prev => ({
                        ...prev,
                        customerName: session.user.name || '',
                        customerEmail: session.user.email || '',
                    }));
                }
            })
            .catch(err => console.error('Failed to fetch session:', err));
    }, [cart.length, isSuccess, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Combine address fields into single string for backend
            const fullAddress = `${formData.streetAddress}, ${formData.city}, ${formData.state} - ${formData.pinCode}`;

            const res = await fetch('/api/orders', {
                method: 'POST',
                body: JSON.stringify({
                    customerName: formData.customerName,
                    customerEmail: formData.customerEmail,
                    customerPhone: formData.customerPhone,
                    address: fullAddress,
                    total,
                    items: cart.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                }),
            });

            if (res.ok) {
                clearCart();
                setIsSuccess(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-surface text-secondary rounded-[2.5rem] flex items-center justify-center border border-primary/5">
                    <CheckCircle2 size={48} />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-primary">Order Confirmed</h1>
                    <p className="text-primary/40 font-medium max-w-sm mx-auto italic">Thank you for your purchase. We've received your order and our farmers are already selecting the best for you.</p>
                </div>
                <button
                    onClick={() => router.push('/')}
                    className="btn-apple btn-apple-primary px-12 py-4 shadow-xl shadow-primary/10"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-32 px-6">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-24">
                <div className="flex-1 space-y-12">
                    <header className="space-y-4">
                        <span className="text-secondary font-bold tracking-[0.2em] uppercase text-[10px]">Step 2 of 2</span>
                        <h1 className="heading-section text-primary">Delivery Details</h1>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-primary/30 uppercase tracking-widest flex items-center gap-2">
                                    <User size={14} /> Full Name
                                </label>
                                <input
                                    required
                                    className="w-full p-4 bg-surface border border-primary/5 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-primary placeholder:text-primary/20"
                                    placeholder="Jane Doe"
                                    value={formData.customerName}
                                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-primary/30 uppercase tracking-widest flex items-center gap-2">
                                    <Mail size={14} /> Email Address
                                </label>
                                <input
                                    required
                                    type="email"
                                    className="w-full p-4 bg-surface border border-primary/5 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-primary placeholder:text-primary/20"
                                    placeholder="jane@example.com"
                                    value={formData.customerEmail}
                                    onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-primary/30 uppercase tracking-widest flex items-center gap-2">
                                    <Phone size={14} /> Phone Number
                                </label>
                                <input
                                    required
                                    type="tel"
                                    maxLength={10}
                                    pattern="[0-9]{10}"
                                    className="w-full p-4 bg-surface border border-primary/5 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-primary placeholder:text-primary/20"
                                    placeholder="9876543210"
                                    value={formData.customerPhone}
                                    onChange={e => {
                                        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                        if (value.length <= 10) {
                                            setFormData({ ...formData, customerPhone: value });
                                        }
                                    }}
                                />
                                <p className="text-xs text-primary/30">Enter 10-digit mobile number without +91</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-primary/30 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={14} /> Shipping Address
                            </label>
                            <input
                                required
                                className="w-full p-4 bg-surface border border-primary/5 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-primary placeholder:text-primary/20"
                                placeholder="House No., Building Name, Street"
                                value={formData.streetAddress}
                                onChange={e => setFormData({ ...formData, streetAddress: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-primary/30 uppercase tracking-widest">City</label>
                                <input
                                    required
                                    className="w-full p-4 bg-surface border border-primary/5 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-primary placeholder:text-primary/20"
                                    placeholder="Hyderabad"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-primary/30 uppercase tracking-widest">State</label>
                                <select
                                    required
                                    className="w-full p-4 bg-surface border border-primary/5 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-primary"
                                    value={formData.state}
                                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                                >
                                    <option value="">Select State</option>
                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                    <option value="Assam">Assam</option>
                                    <option value="Bihar">Bihar</option>
                                    <option value="Chhattisgarh">Chhattisgarh</option>
                                    <option value="Goa">Goa</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                                    <option value="Jharkhand">Jharkhand</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Kerala">Kerala</option>
                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Manipur">Manipur</option>
                                    <option value="Meghalaya">Meghalaya</option>
                                    <option value="Mizoram">Mizoram</option>
                                    <option value="Nagaland">Nagaland</option>
                                    <option value="Odisha">Odisha</option>
                                    <option value="Punjab">Punjab</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                    <option value="Sikkim">Sikkim</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Telangana">Telangana</option>
                                    <option value="Tripura">Tripura</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="Uttarakhand">Uttarakhand</option>
                                    <option value="West Bengal">West Bengal</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Puducherry">Puducherry</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-primary/30 uppercase tracking-widest">PIN Code</label>
                                <input
                                    required
                                    type="text"
                                    maxLength={6}
                                    pattern="[0-9]{6}"
                                    className="w-full p-4 bg-surface border border-primary/5 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-primary placeholder:text-primary/20"
                                    placeholder="560001"
                                    value={formData.pinCode}
                                    onChange={e => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 6) {
                                            setFormData({ ...formData, pinCode: value });
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="pt-10 border-t border-primary/5 space-y-8">
                            <div className="bg-surface p-8 rounded-[2rem] border border-primary/5 flex items-center gap-6">
                                <div className="w-12 h-12 bg-white text-secondary rounded-xl flex items-center justify-center shrink-0 border border-primary/5 shadow-sm">
                                    <span className="font-bold text-lg">₹</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-primary">Cash on Delivery</p>
                                    <p className="text-xs text-primary/40 font-medium">Pay at your doorstep when you receive your fresh harvest.</p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-apple btn-apple-primary w-full py-5 text-lg shadow-xl shadow-primary/10 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        Processing Order...
                                    </>
                                ) : `Complete Order (₹${total})`}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="w-full lg:w-[400px]">
                    <div className="bg-surface p-10 rounded-[2.5rem] border border-primary/5 sticky top-32 space-y-10">
                        <h2 className="text-sm font-bold text-primary/30 uppercase tracking-[0.2em] border-b border-primary/5 pb-6">Bag Summary</h2>
                        <div className="space-y-8">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <p className="font-bold text-primary text-sm line-clamp-1">{item.name}</p>
                                        <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">{item.quantity} x ₹{item.price}</p>
                                    </div>
                                    <p className="font-bold text-primary text-sm shrink-0">₹{item.price * item.quantity}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-primary/5 flex justify-between items-center">
                            <span className="text-lg font-bold text-primary">Total</span>
                            <span className="text-2xl font-bold text-primary">₹{total}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
