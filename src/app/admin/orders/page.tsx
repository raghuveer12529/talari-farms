'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, Loader2, XCircle, Ship } from 'lucide-react';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState<{ orderId: string; newStatus: string } | null>(null);

    useEffect(() => {
        fetchOrders();
        // Mark orders as viewed
        localStorage.setItem('lastViewedOrders', new Date().toISOString());
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const res = await fetch('/api/orders');
        const json = await res.json();
        setOrders(json);
        setLoading(false);
    };

    const updateStatus = async (orderId: string, status: string) => {
        const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });

        if (res.ok) {
            fetchOrders();
            setConfirmDialog(null);
        } else {
            const error = await res.json();
            alert(error.error || 'Failed to update status');
            setConfirmDialog(null);
        }
    };

    const handleStatusChange = (orderId: string, newStatus: string, currentStatus: string) => {
        if (newStatus === currentStatus) return;
        setConfirmDialog({ orderId, newStatus });
    };

    if (loading && orders.length === 0) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary" size={40} /></div>;

    const statusIcons: any = {
        PLACED: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Placed' },
        PACKED: { icon: Package, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Packed' },
        SHIPPED: { icon: Ship, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Shipped' },
        DELIVERED: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Delivered' },
        CANCELLED: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Cancelled' },
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Order Management</h1>
                <p className="text-stone-500">View and update customer orders</p>
            </div>

            <div className="space-y-6">
                {orders.map((order) => {
                    const StatusIcon = statusIcons[order.status].icon;
                    return (
                        <div key={order.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-6 border-b border-stone-100 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`${statusIcons[order.status].bg} ${statusIcons[order.status].color} p-3 rounded-full`}>
                                        <StatusIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-900">Order #{order.id.slice(-6).toUpperCase()}</h3>
                                        <p className="text-sm text-stone-500">{new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right mr-4">
                                        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total</p>
                                        <p className="text-lg font-bold text-stone-900">₹{order.total.toLocaleString()}</p>
                                    </div>
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value, order.status)}
                                        className="bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary appearance-none pr-10 relative"
                                    >
                                        <option value="PLACED">Placed</option>
                                        <option value="PACKED">Packed</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Customer Details</h4>
                                    <div className="space-y-2">
                                        <p className="font-bold text-stone-900">{order.customerName}</p>
                                        <p className="text-stone-600 font-medium">{order.customerEmail}</p>
                                        <p className="text-stone-600">{order.customerPhone}</p>
                                        <p className="text-stone-500 text-sm mt-2 flex items-start gap-2">
                                            <Truck size={16} className="mt-1 flex-shrink-0" />
                                            {order.address}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Order Items</h4>
                                    <ul className="space-y-3">
                                        {order.items.map((item: any) => (
                                            <li key={item.id} className="flex justify-between items-center text-sm">
                                                <span className="text-stone-700">
                                                    <span className="font-bold text-stone-900">{item.quantity}x</span> {item.product.name}
                                                </span>
                                                <span className="font-semibold">₹{item.price * item.quantity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Status History */}
                            {order.statusHistory && order.statusHistory.length > 0 && (
                                <div className="px-6 pb-6">
                                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Status History</h4>
                                    <div className="space-y-2">
                                        {order.statusHistory.map((history: any) => (
                                            <div key={history.id} className="flex items-center gap-3 text-xs text-stone-500">
                                                <div className={`w-2 h-2 rounded-full ${statusIcons[history.newStatus].color.replace('text-', 'bg-')}`}></div>
                                                <span className="font-semibold text-stone-700">{statusIcons[history.newStatus].label}</span>
                                                <span>•</span>
                                                <span>{new Date(history.changedAt).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-stone-900 mb-2">Confirm Status Change</h3>
                        <p className="text-stone-600 mb-6">
                            Are you sure you want to change the order status to <span className="font-bold">{statusIcons[confirmDialog.newStatus].label}</span>?
                            {(confirmDialog.newStatus === 'PACKED' || confirmDialog.newStatus === 'SHIPPED') && (
                                <span className="block mt-2 text-sm text-emerald-600">
                                    ✉️ Customer will be notified via email
                                </span>
                            )}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDialog(null)}
                                className="flex-1 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg font-medium hover:bg-stone-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => updateStatus(confirmDialog.orderId, confirmDialog.newStatus)}
                                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
