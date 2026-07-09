'use client';

import { useState, useTransition } from 'react';
import { createLoan, createRepayment } from '@/actions/loans';
import { X, Plus } from 'lucide-react';

const INPUT =
  'w-full bg-input border border-border/40 rounded-[0.875rem] px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all';

export function AddLoanForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createLoan(data);
        setOpen(false);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-gradient-hero text-white rounded-full px-5 py-2.5 text-sm font-semibold shadow-soft hover:shadow-glow hover:scale-105 transition-all"
      >
        <Plus size={16} /> Add Loan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="glass-card rounded-[2rem] p-8 w-full max-w-md shadow-elegant">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground">New Loan</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Amount (₹) *</label>
                <input name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Source *</label>
                <input name="source" type="text" required placeholder="Bank / Person name" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Date *</label>
                <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input name="description" type="text" placeholder="Purpose of loan" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea name="notes" rows={2} placeholder="Any additional notes" className={`${INPUT} resize-none`} />
              </div>
              {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
              <button
                type="submit"
                disabled={pending}
                className="w-full bg-gradient-hero text-white py-3 rounded-[0.875rem] font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {pending ? 'Saving…' : 'Save Loan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function AddRepaymentForm({ loanId, loanSource }: { loanId: string; loanSource: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const data = new FormData(e.currentTarget);
    data.set('loanId', loanId);
    startTransition(async () => {
      try {
        await createRepayment(data);
        setOpen(false);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-primary border border-primary/30 rounded-full px-3 py-1.5 hover:bg-primary/5 transition-all"
      >
        + Repayment
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="glass-card rounded-[2rem] p-8 w-full max-w-md shadow-elegant">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Add Repayment</h2>
                <p className="text-sm text-muted-foreground mt-1">For loan from {loanSource}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Amount (₹) *</label>
                <input name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Date *</label>
                <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea name="notes" rows={2} placeholder="Any notes about this repayment" className={`${INPUT} resize-none`} />
              </div>
              {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
              <button
                type="submit"
                disabled={pending}
                className="w-full bg-gradient-hero text-white py-3 rounded-[0.875rem] font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {pending ? 'Saving…' : 'Save Repayment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
