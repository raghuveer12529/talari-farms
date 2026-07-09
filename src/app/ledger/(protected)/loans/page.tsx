import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { AddLoanForm, AddRepaymentForm } from '@/components/ledger/LoanForm';
import DeleteButton from '@/components/ledger/DeleteButton';
import { deleteLoan, deleteRepayment } from '@/actions/loans';
import { Landmark, CheckCircle2 } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default async function LoansPage() {
  const session = await auth();
  const role = (session!.user as { role: string }).role;
  const isAdmin = role === 'ADMIN';

  const loans = await prisma.loan.findMany({
    include: { repayments: { include: { paidBy: true }, orderBy: { date: 'desc' } } },
    orderBy: { date: 'desc' },
  });

  const totalLoaned = loans.reduce((s, l) => s + l.amount, 0);
  const totalRepaid = loans.flatMap((l) => l.repayments).reduce((s, r) => s + r.amount, 0);
  const outstanding = totalLoaned - totalRepaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Finance</span>
          <h1 className="font-display text-3xl font-bold text-foreground mt-1">
            Loan <span className="gradient-text">Tracker</span>
          </h1>
        </div>
        {isAdmin && <AddLoanForm />}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Borrowed</p>
          <p className="font-display text-lg font-bold text-foreground">{fmt(totalLoaned)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Repaid</p>
          <p className="font-display text-lg font-bold text-green-600">{fmt(totalRepaid)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Outstanding</p>
          <p className={`font-display text-lg font-bold ${outstanding > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {fmt(outstanding)}
          </p>
        </div>
      </div>

      {/* Per-partner outstanding */}
      {outstanding > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm font-bold text-muted-foreground mb-3">Outstanding per partner (equal split)</p>
          <p className="font-display text-2xl font-bold gradient-text">{fmt(outstanding / 3)} <span className="text-base text-muted-foreground font-normal">each</span></p>
        </div>
      )}

      {/* Loan list */}
      {loans.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Landmark size={32} className="text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground text-sm">No loans recorded yet.</p>
          {isAdmin && <p className="text-xs text-muted-foreground mt-1">Click &quot;Add Loan&quot; to record a loan.</p>}
        </div>
      ) : (
        <div className="space-y-5">
          {loans.map((loan) => {
            const repaid = loan.repayments.reduce((s, r) => s + r.amount, 0);
            const loanOutstanding = loan.amount - repaid;
            const isPaidOff = loanOutstanding <= 0;

            return (
              <div key={loan.id} className="glass-card rounded-2xl p-6 space-y-4">
                {/* Loan header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPaidOff ? 'bg-green-100' : 'bg-primary/10'}`}>
                      {isPaidOff
                        ? <CheckCircle2 size={18} className="text-green-600" />
                        : <Landmark size={18} className="text-primary" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-foreground">{loan.source}</h3>
                        {isPaidOff && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid Off</span>
                        )}
                      </div>
                      {loan.description && <p className="text-sm text-muted-foreground mt-0.5">{loan.description}</p>}
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Taken on {new Date(loan.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display text-xl font-bold text-foreground">{fmt(loan.amount)}</p>
                    {!isPaidOff && (
                      <p className="text-xs text-red-500 font-semibold mt-0.5">{fmt(loanOutstanding)} left</p>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {loan.amount > 0 && (
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-hero rounded-full transition-all"
                      style={{ width: `${Math.min((repaid / loan.amount) * 100, 100)}%` }}
                    />
                  </div>
                )}

                {/* Repayments */}
                {loan.repayments.length > 0 && (
                  <div className="border-t border-border/40 pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Repayments</p>
                    <div className="space-y-2">
                      {loan.repayments.map((r) => (
                        <div key={r.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-muted-foreground">{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                            <span className="text-foreground font-medium">— {r.paidBy.name}</span>
                            {r.notes && <span className="text-muted-foreground text-[11px]">· {r.notes}</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-green-600">{fmt(r.amount)}</span>
                            {isAdmin && (
                              <DeleteButton
                                label="repayment"
                                action={async () => {
                                  'use server';
                                  await deleteRepayment(r.id);
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <AddRepaymentForm loanId={loan.id} loanSource={loan.source} />
                  {isAdmin && (
                    <DeleteButton
                      label="loan"
                      action={async () => {
                        'use server';
                        await deleteLoan(loan.id);
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
