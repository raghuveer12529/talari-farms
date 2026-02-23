'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';

type Props = {
    partnerName: string;
    netBalance: number;
    totalPaid: number;
    share: number;
};

export default function SettlementCard({ partnerName, netBalance, totalPaid, share }: Props) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Logic: Net Balance > 0 means they paid EXTRA, so they should RECEIVE money.
    // Net Balance < 0 means they paid LESS than share, so they need to PAY.
    const isReceiving = netBalance > 0;
    const isSettled = Math.abs(netBalance) < 1; // Tolerance for float errors

    const statusColor = isSettled
        ? 'bg-stone-100 text-stone-600 border-stone-200'
        : isReceiving
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
            : 'bg-rose-50 text-rose-800 border-rose-100';

    const icon = isSettled
        ? <CheckCircle size={18} />
        : isReceiving
            ? <CheckCircle size={18} className="text-emerald-600" />
            : <AlertCircle size={18} className="text-rose-600" />;

    const actionText = isSettled
        ? "Settled"
        : isReceiving
            ? `To Receive ₹${Math.abs(netBalance).toLocaleString()}`
            : `Needs to Pay ₹${Math.abs(netBalance).toLocaleString()}`;

    return (
        <div
            className={`border rounded-xl transition-all cursor-pointer hover:shadow-md ${statusColor}`}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {icon}
                    <div>
                        <h3 className="font-bold text-sm md:text-base">{partnerName}</h3>
                        <p className="text-xs font-semibold opacity-80">{actionText}</p>
                    </div>
                </div>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 pt-0 text-xs md:text-sm border-t border-black/5 mt-2">
                    <div className="mt-3 space-y-2 opacity-80">
                        <div className="flex justify-between">
                            <span>Paid Personally:</span>
                            <span className="font-mono">₹{totalPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Share of Expenses:</span>
                            <span className="font-mono">- ₹{share.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-black/10 pt-1">
                            <span>Net Balance:</span>
                            <span className="font-mono">{netBalance > 0 ? '+' : ''}₹{netBalance.toFixed(0)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
