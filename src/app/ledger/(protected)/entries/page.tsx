import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import EntryForm from '@/components/ledger/EntryForm';
import DeleteButton from '@/components/ledger/DeleteButton';
import { deleteLedgerEntry } from '@/actions/ledger';

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function formatCategory(cat: string) {
  return cat.replace(/_/g, ' ');
}

export default async function EntriesPage() {
  const session = await auth();
  const role = (session!.user as { role: string }).role;

  const entries = await prisma.ledgerEntry.findMany({
    include: { partner: true },
    orderBy: { date: 'desc' },
  });

  const totalIncome = entries.filter((e) => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);
  const totalExpenditure = entries.filter((e) => e.type === 'EXPENDITURE').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Records</span>
          <h1 className="font-display text-3xl font-bold text-foreground mt-1">
            Income & <span className="gradient-text">Expenditure</span>
          </h1>
        </div>
        <EntryForm />
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Income</p>
          <p className="font-display text-lg font-bold text-green-600">{fmt(totalIncome)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Expenditure</p>
          <p className="font-display text-lg font-bold text-red-500">{fmt(totalExpenditure)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Net</p>
          <p className={`font-display text-lg font-bold ${totalIncome - totalExpenditure >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {fmt(totalIncome - totalExpenditure)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {entries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground text-sm">No entries yet. Click &quot;Add Entry&quot; to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/40">
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Type</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Category</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Partner</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Source</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={e.id} className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="px-5 py-3.5 text-muted-foreground font-medium whitespace-nowrap">
                      {new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        e.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {e.type === 'INCOME' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-foreground">{formatCategory(e.category)}</p>
                      {e.notes && <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[160px]">{e.notes}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-foreground font-medium">{e.partner.name}</td>
                    <td className="px-5 py-3.5">
                      {e.source ? (
                        <span className={`text-[11px] font-semibold ${e.source === 'OWN_POCKET' ? 'text-blue-600' : 'text-primary'}`}>
                          {e.source === 'OWN_POCKET' ? 'Own Pocket' : 'Loan Funds'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </td>
                    <td className={`px-5 py-3.5 text-right font-bold tabular-nums ${e.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                      {e.type === 'INCOME' ? '+' : '-'}{fmt(e.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {(role === 'ADMIN' || e.partnerId === session!.user.id) && (
                        <DeleteButton
                          label="entry"
                          action={async () => {
                            'use server';
                            await deleteLedgerEntry(e.id);
                          }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
