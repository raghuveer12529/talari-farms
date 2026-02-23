import { getLoans } from '@/actions/loans';
import AddLoanForm from '@/components/AddLoanForm';
import { BadgeIndianRupee } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LoansPage() {
    const loans = await getLoans();

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Loan Management</h1>
                    <p className="text-stone-500">Track farm loans and liabilities</p>
                </div>
            </div>

            <AddLoanForm />

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-amber-50 border-b border-amber-100">
                        <tr>
                            <th className="p-4 font-bold text-amber-900">Loan Name</th>
                            <th className="p-4 font-bold text-amber-900">Principal</th>
                            <th className="p-4 font-bold text-amber-900">Tenure & Interest</th>
                            <th className="p-4 font-bold text-amber-900">Total Payable</th>
                            <th className="p-4 font-bold text-amber-900">Start Date</th>
                            <th className="p-4 font-bold text-amber-900">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-stone-500">No loans active.</td>
                            </tr>
                        ) : (
                            loans.map((loan) => (
                                <tr key={loan.id} className="border-b border-stone-100 hover:bg-amber-50/50 transition-colors">
                                    <td className="p-4 font-semibold text-stone-900">{loan.name}</td>
                                    <td className="p-4 text-stone-900">₹{loan.principalAmount.toLocaleString()}</td>
                                    <td className="p-4 text-sm">
                                        <div>{loan.tenureMonths} Months</div>
                                        <div className="text-xs text-stone-500">{loan.interestRate}% {loan.interestType}</div>
                                    </td>
                                    <td className="p-4 font-bold text-red-600">₹{loan.totalPayable.toLocaleString()}</td>
                                    <td className="p-4 text-sm text-stone-600">{new Date(loan.startDate).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${loan.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {loan.status}
                                        </span>
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
