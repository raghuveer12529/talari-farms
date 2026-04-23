import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import { Package, Calendar, MapPin, IndianRupee, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    // Fetch user and their orders
    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    const orders = await prisma.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                include: { product: true }
            }
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
            case 'SHIPPED': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-orange-50 text-orange-600 border-orange-100';
        }
    };

    return (
        <div className="bg-surface min-h-screen py-24 px-4 sm:px-6 md:px-12">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header Profile Section */}
                <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-primary/5 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-full flex items-center justify-center text-primary/30 shrink-0 border-4 border-white shadow-lg">
                        <span className="text-4xl font-serif font-bold">
                            {session.user.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="space-y-4 text-center md:text-left pt-2">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary tracking-tight">{session.user.name}</h1>
                            <p className="text-sm font-medium text-primary/40 mt-1">{session.user.email}</p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="px-3 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                Premium Member
                            </span>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                {orders.length} Orders Placed
                            </span>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold text-primary px-2">Your Harvest History</h2>

                    {orders.length === 0 ? (
                        <div className="bg-white p-16 rounded-[2.5rem] border border-primary/5 text-center space-y-6">
                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/20">
                                <Package size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-primary">No orders yet</h3>
                                <p className="text-sm text-primary/40 max-w-sm mx-auto">You haven't experienced our farm-fresh harvest yet. Start exploring our premium produce.</p>
                            </div>
                            <Link href="/products" className="inline-block btn-apple btn-apple-primary px-8 py-3 shadow-lg shadow-primary/10">
                                Shop Harvest
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-primary/5 hover:border-primary/10 hover:shadow-xl hover:shadow-primary/5 transition-all space-y-6 group">
                                    {/* Order Header */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-stone-100">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-bold text-primary font-mono">#{order.id.slice(-8).toUpperCase()}</h3>
                                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium text-stone-400 flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Amount</p>
                                            <p className="text-xl font-bold text-primary flex items-center gap-1">
                                                <IndianRupee size={18} />
                                                {order.total}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Order Details Grid */}
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {/* Items */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Harvest Items</h4>
                                            <div className="space-y-3">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="flex items-center gap-4">
                                                        <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-stone-50 border border-stone-100 shrink-0">
                                                            {item.product.image ? (
                                                                <Image
                                                                    src={item.product.image}
                                                                    alt={item.product.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <Package className="w-full h-full p-3 text-stone-300" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-sm text-primary line-clamp-1">{item.product.name}</p>
                                                            <p className="text-xs font-medium text-stone-500">Qty: {item.quantity} × ₹{item.price}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Delivery Info */}
                                        <div className="space-y-4 md:border-l md:border-stone-100 md:pl-8">
                                            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Delivery Details</h4>
                                            <div className="space-y-4 text-sm">
                                                <div className="flex items-start gap-3 text-stone-600 font-medium">
                                                    <MapPin size={16} className="text-stone-400 shrink-0 mt-0.5" />
                                                    <p className="leading-relaxed">{order.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
