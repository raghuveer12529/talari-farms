'use client';

import { useState, useActionState, useEffect } from 'react';
import { addLoan } from '@/actions/loans';
import { Loader2, Plus, Calculator } from 'lucide-react';

export default function AddLoanForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [state, action, isPending] = useActionState(addLoan, {});

    // Quick Calculator State
    const [principal, setPrincipal] = useState(0);
    const [rate, setRate] = useState(12);
    const [tenure, setTenure] = useState(12);
    const [interestType, setInterestType] = useState('SIMPLE');
    const [payable, setPayable] = useState(0);

    useEffect(() => {
        let interest = 0;
        if (interestType === 'SIMPLE') {
            interest = (principal * rate * (tenure / 12)) / 100;
        }
        setPayable(principal + interest);
    }, [principal, rate, tenure, interestType]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn-primary flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg"
            >
                <Plus size={20} /> Add New Loan
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-lg mb-8 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><Calculator className="text-amber-600" /> New Loan Record</h3>
                <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600">
                    Close
                </button>
            </div>

            <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Loan Name / Reference</label>
                    <input
                        name="name"
                        required
                        placeholder="e.g. HDFC Farm Loan 2024"
                        className="w-full p-2 border rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Principal Amount (₹)</label>
                    <input
                        name="principalAmount"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        className="w-full p-2 border rounded-lg"
                        onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input name="startDate" type="date" className="w-full p-2 border rounded-lg" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Interest Rate (% Annual)</label>
                    <input
                        name="interestRate"
                        type="number"
                        step="0.01"
                        required
                        defaultValue={12}
                        className="w-full p-2 border rounded-lg"
                        onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Tenure (Months)</label>
                    <input
                        name="tenureMonths"
                        type="number"
                        required
                        defaultValue={12}
                        className="w-full p-2 border rounded-lg"
                        onChange={(e) => setTenure(parseFloat(e.target.value) || 0)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Interest Type</label>
                    <select
                        name="interestType"
                        className="w-full p-2 border rounded-lg"
                        onChange={(e) => setInterestType(e.target.value)}
                    >
                        <option value="SIMPLE">Simple Interest</option>
                        <option value="COMPOUND">Compound Interest</option>
                    </select>
                </div>

                <div className="col-span-2 bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                        <span className="text-xs font-bold text-amber-700 uppercase block">Estimated Total Payable</span>
                        <span className="text-2xl font-bold text-amber-900">₹{payable.toFixed(2)}</span>
                    </div>
                    <div className="text-right text-xs text-amber-600 max-w-[50%]">
                        *Liability is automatically split equally among all partners.
                    </div>
                </div>

                <div className="col-span-2">
                    {state.errors?._form && <p className="text-red-500 text-sm mb-2">{state.errors._form}</p>}
                    {state.message && <p className="text-green-600 text-sm mb-2">{state.message}</p>}
                    <button type="submit" disabled={isPending} className="w-full btn-primary bg-amber-600 text-white p-3 rounded-lg hover:bg-amber-700 disabled:opacity-50">
                        {isPending ? 'Processing...' : 'Create Loan Record'}
                    </button>
                </div>
            </form>
        </div>
    );
}
