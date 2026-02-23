'use client';

import { useState, useActionState, useEffect } from 'react';
import { addExpense } from '@/actions/expenses';
import { Loader2, Plus } from 'lucide-react';

interface Partner {
    id: string;
    name: string;
}

export default function AddExpenseForm({ partners, walletBalance }: { partners: Partner[], walletBalance: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, action, isPending] = useActionState(addExpense, {});
    const [paymentSource, setPaymentSource] = useState('FARM_WALLET');
    const [amount, setAmount] = useState<number>(0);
    const [partnerAmounts, setPartnerAmounts] = useState<Record<string, number>>({});

    // Reset form after successful submission
    useEffect(() => {
        if (state.message && !state.errors) {
            // Success! Reset all fields
            setAmount(0);
            setPartnerAmounts({});
            setPaymentSource('FARM_WALLET');
            // Close the form after a brief delay so user can see success message
            const timer = setTimeout(() => {
                setIsOpen(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [state.message, state.errors]);

    // Split Logic State
    const isSplitNeeded = paymentSource === 'FARM_WALLET' && amount > walletBalance;
    const walletContribution = isSplitNeeded ? walletBalance : (paymentSource === 'FARM_WALLET' ? amount : 0);
    const remainingAmount = amount - walletContribution;

    // Calculate total partner contributions
    const totalPartnerContribution = Object.values(partnerAmounts).reduce((sum, val) => sum + (val || 0), 0);
    const contributionMismatch = isSplitNeeded && Math.abs(totalPartnerContribution - remainingAmount) > 0.01;

    // Construct JSON for backend
    const splitDetails = {
        wallet: walletContribution,
        partners: {} as Record<string, number>
    };

    if (isSplitNeeded) {
        // Use custom amounts
        Object.entries(partnerAmounts).forEach(([pid, amt]) => {
            if (amt > 0) {
                splitDetails.partners[pid] = amt;
            }
        });
    } else if (paymentSource === 'PARTNER') {
        // Handled by legacy field
    }

    const handlePartnerAmountChange = (partnerId: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setPartnerAmounts(prev => ({
            ...prev,
            [partnerId]: numValue
        }));
    };

    const handleEqualSplit = () => {
        if (partners.length === 0) return;
        const equalShare = remainingAmount / partners.length;
        const newAmounts: Record<string, number> = {};
        partners.forEach(p => {
            newAmounts[p.id] = equalShare;
        });
        setPartnerAmounts(newAmounts);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
            >
                <Plus size={20} /> Add Expense
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-lg mb-8 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">New Expense</h3>
                <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600">
                    Close
                </button>
            </div>

            <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="hidden" name="splitDetails" value={JSON.stringify(splitDetails)} />

                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                        name="title"
                        required
                        placeholder="e.g. Fertilizer Bags"
                        className="w-full p-2 border rounded-lg"
                    />
                    {state.errors?.title && <p className="text-red-500 text-xs">{state.errors.title}</p>}
                </div>

                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                    <input
                        name="amount"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        className="w-full p-2 border rounded-lg"
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    />
                    {state.errors?.amount && <p className="text-red-500 text-xs">{state.errors.amount}</p>}
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Payment Source</label>
                    <select
                        name="paymentSource"
                        className="w-full p-2 border rounded-lg"
                        value={paymentSource}
                        onChange={(e) => setPaymentSource(e.target.value)}
                    >
                        <option value="FARM_WALLET">Farm Wallet (Avail: ₹{walletBalance.toLocaleString()})</option>
                        <option value="PARTNER">Partner Personal Fund</option>
                    </select>
                </div>

                {/* INSUFFICIENT FUNDS / SPLIT UI */}
                {isSplitNeeded && (
                    <div className="col-span-2 bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-3">
                        <p className="text-amber-800 text-sm font-medium flex items-center gap-2">
                            ⚠️ Insufficient Wallet Balance (₹{walletBalance.toLocaleString()})
                        </p>
                        <p className="text-sm text-stone-600">
                            The remaining <strong>₹{remainingAmount.toLocaleString()}</strong> needs to be covered by partners.
                        </p>

                        <div className="flex justify-between items-center">
                            <label className="block text-xs font-bold uppercase text-stone-500">Partner Contributions</label>
                            <button
                                type="button"
                                onClick={handleEqualSplit}
                                className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1 rounded-lg font-medium transition-colors"
                            >
                                Split Equally
                            </button>
                        </div>

                        <div className="space-y-2">
                            {partners.map(p => {
                                const stillNeeded = remainingAmount - totalPartnerContribution;
                                return (
                                    <div key={p.id} className="bg-white p-3 rounded-lg border border-stone-200">
                                        <div className="flex items-center gap-3">
                                            <label className="flex-1 text-sm font-medium text-stone-700">{p.name}</label>
                                            <div className="flex items-center gap-1">
                                                <span className="text-stone-500 text-sm">₹</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={partnerAmounts[p.id] || ''}
                                                    onChange={(e) => handlePartnerAmountChange(p.id, e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-28 p-2 border rounded-lg text-right"
                                                />
                                            </div>
                                        </div>
                                        {stillNeeded > 0 && (
                                            <div className="mt-2 text-xs text-stone-500 flex items-center gap-1">
                                                <span>Still needed:</span>
                                                <span className="font-mono font-semibold text-amber-700">₹{stillNeeded.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-amber-200">
                            <span className="text-sm font-medium text-stone-600">Total Partner Contribution:</span>
                            <span className={`text-sm font-bold ${contributionMismatch ? 'text-rose-600' : 'text-emerald-600'}`}>
                                ₹{totalPartnerContribution.toLocaleString()}
                            </span>
                        </div>

                        {contributionMismatch && (
                            <p className="text-rose-600 text-xs">
                                Partner contributions (₹{totalPartnerContribution.toFixed(2)}) must equal remaining amount (₹{remainingAmount.toFixed(2)})
                            </p>
                        )}
                    </div>
                )}

                {paymentSource === 'PARTNER' && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Paid By</label>
                        <select name="paidByPartnerId" className="w-full p-2 border rounded-lg" required>
                            <option value="">Select Partner</option>
                            {partners.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        {state.errors?.paidByPartnerId && <p className="text-red-500 text-xs">{state.errors.paidByPartnerId}</p>}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select name="category" className="w-full p-2 border rounded-lg">
                        <option value="OTHER">Other</option>
                        <option value="SEEDS">Seeds</option>
                        <option value="FERTILIZER">Fertilizer</option>
                        <option value="LABOUR">Labour</option>
                        <option value="TRANSPORT">Transport</option>
                        <option value="LOAN_PROCESSING">Loan Processing</option>
                        <option value="LOAN_EMI">Loan EMI</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input name="date" type="date" className="w-full p-2 border rounded-lg" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea name="notes" className="w-full p-2 border rounded-lg" rows={2}></textarea>
                </div>

                <div className="col-span-2">
                    {state.errors?._form && <p className="text-red-500 text-sm mb-2">{state.errors._form}</p>}
                    {state.message && <p className="text-green-600 text-sm mb-2">{state.message}</p>}

                    <button
                        type="submit"
                        disabled={isPending || contributionMismatch}
                        className="w-full btn-primary bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16} /> Saving...</span> : 'Save Expense'}
                    </button>
                </div>
            </form>
        </div>
    );
}
