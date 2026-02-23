'use client';

import Link from 'next/link';
import { Trash2, ArrowRight, ShoppingBasket, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function CartPage() {
    const { items: cart, total, updateQuantity, removeItem } = useCartStore();

    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-surface text-primary/10 rounded-[2.5rem] flex items-center justify-center">
                    <ShoppingBasket size={48} />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-primary">Your basket is empty</h1>
                    <p className="text-primary/40 font-medium max-w-xs mx-auto italic">Looks like you haven't added any fresh farm goodness yet.</p>
                </div>
                <Link href="/products" className="btn-apple btn-apple-primary px-12 py-4">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-32 px-6">
            <div className="max-w-5xl mx-auto space-y-16">
                <header className="space-y-4 text-center md:text-left">
                    <span className="text-secondary font-bold tracking-[0.2em] uppercase text-[10px]">Your Selection</span>
                    <h1 className="heading-section text-primary">Review Your Basket</h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-10">
                        {cart.map((item) => (
                            <div key={item.id} className="group flex flex-col sm:flex-row gap-8 items-center border-b border-primary/5 pb-10">
                                <Link href={`/products/${item.id}`} className="w-32 h-32 rounded-2xl overflow-hidden bg-surface shrink-0 border border-primary/5">
                                    <img src={item.image ?? ''} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </Link>

                                <div className="grow space-y-4 text-center sm:text-left">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-xl text-primary">{item.name}</h3>
                                    </div>
                                    <p className="text-sm font-bold text-primary/60">₹{item.price} <span className="text-[10px] font-medium text-primary/30 uppercase tracking-widest ml-1">each</span></p>

                                    <div className="flex items-center justify-center sm:justify-start gap-4">
                                        <div className="flex items-center bg-surface border border-primary/5 rounded-full overflow-hidden">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2.5 hover:bg-white text-primary/40 hover:text-primary transition-all"><Minus size={14} /></button>
                                            <span className="px-4 text-sm font-bold text-primary">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2.5 hover:bg-white text-primary/40 hover:text-primary transition-all"><Plus size={14} /></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center sm:text-right flex flex-col items-center sm:items-end gap-6 sm:min-w-[120px]">
                                    <p className="font-bold text-2xl text-primary">₹{item.price * item.quantity}</p>
                                    <button onClick={() => removeItem(item.id)} className="p-2 text-primary/20 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-surface p-10 rounded-[2.5rem] border border-primary/5 sticky top-32 space-y-8">
                            <h2 className="text-sm font-bold text-primary/30 uppercase tracking-[0.2em] border-b border-primary/5 pb-6">Summary</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-medium text-primary/60">
                                    <span>Subtotal</span>
                                    <span>₹{total}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-primary/60">
                                    <span>Delivery</span>
                                    <span className="text-secondary font-bold text-[10px] uppercase tracking-widest">Complimentary</span>
                                </div>
                                <div className="pt-6 border-t border-primary/5 flex justify-between items-center">
                                    <span className="text-lg font-bold text-primary">Total</span>
                                    <span className="text-2xl font-bold text-primary">₹{total}</span>
                                </div>
                            </div>

                            <Link href="/checkout" className="btn-apple btn-apple-primary w-full py-4 flex items-center justify-center gap-2 group text-base">
                                Proceed to Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <p className="text-[10px] text-primary/20 text-center uppercase tracking-widest font-bold">
                                Pure quality guaranteed
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
