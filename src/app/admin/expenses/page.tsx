import { getExpenses, getFarmWalletBalance } from '@/actions/expenses';
import AddExpenseForm from '@/components/AddExpenseForm';
import prisma from '@/lib/prisma';
import { IndianRupee, User, Wallet } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
    const expenses = await getExpenses();
    const walletBalance = await getFarmWalletBalance();
    const partners = await prisma.user.findMany({ where: { role: 'PARTNER' }, select: { id: true, name: true } });

    // Ensure name is not null for strict typing
    const safePartners = partners.map(p => ({ ...p, name: p.name || 'Unknown' }));

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Expense Management</h1>
                    <p className="text-stone-500">Track farm costs and partner payments</p>
                </div>
                <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-100">
                    <Wallet size={20} />
                    <div>
                        <p className="text-xs font-bold uppercase">Farm Wallet Balance</p>
                        <p className="text-xl font-bold">₹{walletBalance.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <AddExpenseForm partners={safePartners} walletBalance={walletBalance} />

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            <th className="p-4 font-bold text-stone-700">Date</th>
                            <th className="p-4 font-bold text-stone-700">Title</th>
                            <th className="p-4 font-bold text-stone-700">Source / Paid By</th>
                            <th className="p-4 font-bold text-stone-700">Category</th>
                            <th className="p-4 font-bold text-stone-700 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-stone-500">No expenses recorded yet.</td>
                            </tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                                    <td className="p-4 text-sm text-stone-600">
                                        {new Date(expense.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 font-semibold text-stone-900">
                                        {expense.title}
                                        {expense.notes && <div className="text-xs text-stone-400 font-normal mt-1">{expense.notes}</div>}
                                    </td>
                                    <td className="p-4">
                                        {expense.paymentSource === 'FARM_WALLET' ? (
                                            <span className="flex items-center gap-2 text-sm text-emerald-700 font-medium badge-emerald bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                                <Wallet size={14} /> Farm Wallet
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-sm text-stone-700 badge-stone bg-stone-100 px-2 py-1 rounded-full w-fit">
                                                <User size={14} /> {expense.paidBy?.name || 'Partner'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-stone-900">
                                        ₹{expense.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
