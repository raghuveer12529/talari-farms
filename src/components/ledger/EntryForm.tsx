'use client';

import { useState, useTransition } from 'react';
import { createLedgerEntry } from '@/actions/ledger';
import { X, Plus } from 'lucide-react';

const INPUT =
  'w-full bg-input border border-border/40 rounded-[0.875rem] px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all';

const INCOME_CATEGORIES = ['FRUIT_SALES', 'JUICE_SALES', 'POWDER_SALES', 'OIL_SALES', 'OTHER'];
const EXPENDITURE_CATEGORIES = ['SETUP', 'FERTILIZER', 'LABOR', 'EQUIPMENT', 'MAINTENANCE', 'UTILITIES', 'OTHER'];

function formatCategoryLabel(cat: string) {
  return cat.replace(/_/g, ' ');
}

export default function EntryForm() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'INCOME' | 'EXPENDITURE'>('EXPENDITURE');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENDITURE_CATEGORIES;

  function handleTypeChange(newType: 'INCOME' | 'EXPENDITURE') {
    setType(newType);
    setCategory('');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const data = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createLedgerEntry(data);
        setOpen(false);
        setCategory('');
        setType('EXPENDITURE');
        (e.target as HTMLFormElement).reset();
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
        <Plus size={16} /> Add Entry
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="glass-card rounded-[2rem] p-8 w-full max-w-md shadow-elegant">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground">New Entry</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type toggle */}
              <div className="flex rounded-2xl overflow-hidden border border-border/40 p-1 gap-1 bg-muted">
                {(['INCOME', 'EXPENDITURE'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                      type === t
                        ? t === 'INCOME'
                          ? 'bg-green-500 text-white shadow-soft'
                          : 'bg-gradient-hero text-white shadow-soft'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {t === 'INCOME' ? 'Income' : 'Expenditure'}
                  </button>
                ))}
              </div>
              <input type="hidden" name="type" value={type} />

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Amount (₹) *</label>
                <input name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" className={INPUT} />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Category *</label>
                <select
                  name="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={INPUT}
                >
                  <option value="" disabled>Select category…</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{formatCategoryLabel(c)}</option>
                  ))}
                </select>
              </div>

              {/* Source — only for expenditure */}
              {type === 'EXPENDITURE' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Funded From *</label>
                  <select name="source" required className={INPUT}>
                    <option value="" disabled>Select source…</option>
                    <option value="OWN_POCKET">Own Pocket (adds to my capital)</option>
                    <option value="LOAN_FUNDS">Loan Funds</option>
                  </select>
                </div>
              )}

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Date *</label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className={INPUT}
                />
              </div>

              {/* Notes — required if OTHER */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">
                  Notes {category === 'OTHER' ? '*' : <span className="text-muted-foreground font-normal">(optional)</span>}
                </label>
                <textarea
                  name="notes"
                  required={category === 'OTHER'}
                  rows={2}
                  placeholder={category === 'OTHER' ? 'Please describe this entry…' : 'Additional notes…'}
                  className={`${INPUT} resize-none`}
                />
              </div>

              {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}

              <button
                type="submit"
                disabled={pending}
                className="w-full bg-gradient-hero text-white py-3 rounded-[0.875rem] font-bold text-sm mt-2 hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {pending ? 'Saving…' : 'Save Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
