'use client';

import { useState, useMemo } from 'react';
import { Scale, TrendingUp, TrendingDown, Landmark, ArrowRight } from 'lucide-react';

type Period = '1M' | '3M' | '6M' | '1Y' | 'ALL';

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function getFromDate(period: Period): Date | null {
  if (period === 'ALL') return null;
  const d = new Date();
  if (period === '1M') d.setMonth(d.getMonth() - 1);
  if (period === '3M') d.setMonth(d.getMonth() - 3);
  if (period === '6M') d.setMonth(d.getMonth() - 6);
  if (period === '1Y') d.setFullYear(d.getFullYear() - 1);
  return d;
}

interface Entry {
  id: string;
  type: string;
  amount: number;
  category: string;
  date: Date;
  source: string | null;
  notes: string | null;
  partnerId: string;
  partner: { id: string; name: string };
}

interface Repayment {
  id: string;
  amount: number;
  date: Date;
  paidById: string;
  paidBy: { id: string; name: string };
}

interface Loan {
  id: string;
  amount: number;
  source: string;
  date: Date;
  repayments: Repayment[];
}

interface Partner {
  id: string;
  name: string;
  role: string;
}

interface Props {
  entries: Entry[];
  loans: Loan[];
  partners: Partner[];
}

const PERIODS: { label: string; value: Period }[] = [
  { label: '1 Month', value: '1M' },
  { label: '3 Months', value: '3M' },
  { label: '6 Months', value: '6M' },
  { label: '1 Year', value: '1Y' },
  { label: 'All Time', value: 'ALL' },
];

export default function SettlementClient({ entries, loans, partners }: Props) {
  const [period, setPeriod] = useState<Period>('ALL');

  const { filteredEntries, stats } = useMemo(() => {
    const fromDate = getFromDate(period);
    const filtered = fromDate
      ? entries.filter((e) => new Date(e.date) >= fromDate)
      : entries;

    const totalIncome = filtered.filter((e) => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);
    const totalOwnPocket = filtered.filter((e) => e.type === 'EXPENDITURE' && e.source === 'OWN_POCKET').reduce((s, e) => s + e.amount, 0);
    const totalLoanFunded = filtered.filter((e) => e.type === 'EXPENDITURE' && e.source === 'LOAN_FUNDS').reduce((s, e) => s + e.amount, 0);
    const equalShare = totalOwnPocket / (partners.length || 1);
    const incomeShare = totalIncome / (partners.length || 1);

    const totalLoaned = loans.reduce((s, l) => s + l.amount, 0);
    const totalRepaid = loans.flatMap((l) => l.repayments).reduce((s, r) => s + r.amount, 0);
    const loanOutstanding = totalLoaned - totalRepaid;
    const loanSharePerPartner = loanOutstanding / (partners.length || 1);

    const partnerStats = partners.map((p) => {
      const ownPocket = filtered.filter((e) => e.type === 'EXPENDITURE' && e.source === 'OWN_POCKET' && e.partnerId === p.id).reduce((s, e) => s + e.amount, 0);
      const loanFunded = filtered.filter((e) => e.type === 'EXPENDITURE' && e.source === 'LOAN_FUNDS' && e.partnerId === p.id).reduce((s, e) => s + e.amount, 0);
      const income = filtered.filter((e) => e.type === 'INCOME' && e.partnerId === p.id).reduce((s, e) => s + e.amount, 0);
      const netPosition = ownPocket - equalShare;

      return { ...p, ownPocket, loanFunded, income, netPosition, equalShare, incomeShare, loanSharePerPartner };
    });

    return {
      filteredEntries: filtered,
      stats: { totalIncome, totalOwnPocket, totalLoanFunded, equalShare, incomeShare, loanOutstanding, loanSharePerPartner, partnerStats },
    };
  }, [entries, loans, partners, period]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Accounting</span>
        <h1 className="font-display text-3xl font-bold text-foreground mt-1">
          Settlement <span className="gradient-text">View</span>
        </h1>
      </div>

      {/* Period filter */}
      <div className="flex gap-2 flex-wrap">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              period === p.value
                ? 'bg-gradient-hero text-white shadow-soft'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-border/60'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Overall summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-green-600" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Total Income</span>
          </div>
          <p className="font-display text-xl font-bold text-green-600">{fmt(stats.totalIncome)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{fmt(stats.incomeShare)} per partner</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={14} className="text-blue-600" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Own Pocket</span>
          </div>
          <p className="font-display text-xl font-bold text-blue-600">{fmt(stats.totalOwnPocket)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{fmt(stats.equalShare)} equal share</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Landmark size={14} className="text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Loan Funded</span>
          </div>
          <p className="font-display text-xl font-bold text-primary">{fmt(stats.totalLoanFunded)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">From loan pool</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Scale size={14} className="text-foreground" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Loan Outstanding</span>
          </div>
          <p className="font-display text-xl font-bold text-red-500">{fmt(stats.loanOutstanding)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{fmt(stats.loanSharePerPartner)} per partner</p>
        </div>
      </div>

      {/* Per-partner settlement */}
      <div className="space-y-4">
        <h2 className="font-bold text-foreground flex items-center gap-2">
          <Scale size={16} className="text-primary" />
          Partner Net Positions
        </h2>

        {stats.partnerStats.map((p) => {
          const owedOrOwes = p.netPosition >= 0 ? 'Farm owes' : 'Owes farm';
          const netAbs = Math.abs(p.netPosition);

          return (
            <div key={p.id} className="glass-card rounded-2xl p-6">
              {/* Name row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{p.role}</p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${p.netPosition >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {owedOrOwes} {fmt(netAbs)}
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Capital Contributed</p>
                  <p className="font-bold text-blue-700">{fmt(p.ownPocket)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">own pocket</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Equal Share</p>
                  <p className="font-bold text-foreground">{fmt(p.equalShare)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">should pay</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Income Share</p>
                  <p className="font-bold text-green-700">{fmt(p.incomeShare)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">1/3 of income</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Loan Liability</p>
                  <p className="font-bold text-red-600">{fmt(p.loanSharePerPartner)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">1/3 of loan</p>
                </div>
              </div>

              {/* Net position explanation */}
              <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{fmt(p.ownPocket)}</span>
                <span>contributed</span>
                <ArrowRight size={12} />
                <span className="font-semibold text-foreground">{fmt(p.equalShare)}</span>
                <span>equal share</span>
                <span className="ml-auto">
                  Net:{' '}
                  <span className={`font-bold ${p.netPosition >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {p.netPosition >= 0 ? '+' : ''}{fmt(p.netPosition)}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-muted-foreground text-sm">No entries found for the selected period.</p>
        </div>
      )}
    </div>
  );
}
