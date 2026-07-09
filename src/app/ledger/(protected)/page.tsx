import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { TrendingUp, TrendingDown, Landmark, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function formatCategory(cat: string) {
  return cat.replace(/_/g, ' ');
}

export default async function LedgerDashboard() {
  const session = await auth();
  const userId = session!.user.id;

  const [entries, loans, partners] = await Promise.all([
    prisma.ledgerEntry.findMany({ include: { partner: true }, orderBy: { date: 'desc' } }),
    prisma.loan.findMany({ include: { repayments: true }, orderBy: { date: 'desc' } }),
    prisma.user.findMany({ select: { id: true, name: true, role: true } }),
  ]);

  const totalIncome = entries.filter((e) => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);
  const totalExpenditure = entries.filter((e) => e.type === 'EXPENDITURE').reduce((s, e) => s + e.amount, 0);
  const netLedger = totalIncome - totalExpenditure;
  const totalLoaned = loans.reduce((s, l) => s + l.amount, 0);
  const totalRepaid = loans.flatMap((l) => l.repayments).reduce((s, r) => s + r.amount, 0);
  const loanOutstanding = totalLoaned - totalRepaid;

  const partnerStats = partners.map((p) => {
    const ownPocket = entries
      .filter((e) => e.type === 'EXPENDITURE' && e.source === 'OWN_POCKET' && e.partnerId === p.id)
      .reduce((s, e) => s + e.amount, 0);
    const totalOwnPocket = entries
      .filter((e) => e.type === 'EXPENDITURE' && e.source === 'OWN_POCKET')
      .reduce((s, e) => s + e.amount, 0);
    const equalShare = totalOwnPocket / 3;
    const net = ownPocket - equalShare;
    return { ...p, ownPocket, net };
  });

  const recentEntries = entries.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Farm Ledger</span>
        <h1 className="font-display text-3xl font-bold text-foreground mt-1">
          Financial <span className="gradient-text">Overview</span>
        </h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Total Income</span>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp size={14} className="text-green-600" />
            </div>
          </div>
          <p className="font-display text-xl font-bold text-green-600">{fmt(totalIncome)}</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Total Spent</span>
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown size={14} className="text-red-500" />
            </div>
          </div>
          <p className="font-display text-xl font-bold text-red-500">{fmt(totalExpenditure)}</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Net Balance</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${netLedger >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {netLedger >= 0
                ? <ArrowUpRight size={14} className="text-green-600" />
                : <ArrowDownRight size={14} className="text-red-500" />}
            </div>
          </div>
          <p className={`font-display text-xl font-bold ${netLedger >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {fmt(netLedger)}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Loan Outstanding</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Landmark size={14} className="text-primary" />
            </div>
          </div>
          <p className="font-display text-xl font-bold text-primary">{fmt(loanOutstanding)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Partner contributions */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Wallet size={16} className="text-primary" />
            <h2 className="font-bold text-foreground">Partner Capital (Own Pocket)</h2>
          </div>
          <div className="space-y-4">
            {partnerStats.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xs font-bold">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.id === userId ? 'You' : p.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{fmt(p.ownPocket)}</p>
                  <p className={`text-[11px] font-semibold ${p.net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {p.net >= 0 ? 'Farm owes' : 'Owes farm'} {fmt(Math.abs(p.net))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent entries */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-bold text-foreground mb-5">Recent Entries</h2>
          {recentEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No entries yet. Add your first entry.</p>
          ) : (
            <div className="space-y-3">
              {recentEntries.map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${e.type === 'INCOME' ? 'bg-green-500' : 'bg-red-400'}`} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{formatCategory(e.category)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {e.partner.name} · {new Date(e.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${e.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                    {e.type === 'INCOME' ? '+' : '-'}{fmt(e.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loan summary */}
      {loans.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Landmark size={16} className="text-primary" />
            <h2 className="font-bold text-foreground">Loan Summary</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-2xl">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Borrowed</p>
              <p className="font-display text-lg font-bold text-foreground">{fmt(totalLoaned)}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-2xl">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Repaid</p>
              <p className="font-display text-lg font-bold text-green-600">{fmt(totalRepaid)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-2xl">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Outstanding</p>
              <p className="font-display text-lg font-bold text-red-500">{fmt(loanOutstanding)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
