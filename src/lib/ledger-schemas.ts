import { z } from 'zod';

/**
 * Validation for the partner ledger (loans + income/expenditure).
 *
 * These run on the server: the ledger forms post directly to server actions,
 * so the HTML `required` / `min` attributes are hints, not enforcement.
 */

/** Largest value Decimal(12,2) can hold — the column type used for ledger money. */
export const MAX_AMOUNT = 9_999_999_999.99;

/** A rupee amount: positive, within Decimal(12,2), and no finer than paise. */
const money = z.coerce
  .number()
  .refine((n) => n > 0, 'Amount must be positive')
  .refine((n) => n <= MAX_AMOUNT, 'Amount is too large')
  .refine(
    (n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-9,
    'Amount cannot be finer than paise (at most 2 decimal places)',
  );

/** Optional free text: trims, and stores blank as null rather than "". */
const optionalText = z
  .string()
  .nullish()
  .transform((v) => v?.trim() || null);

export const ledgerEntrySchema = z
  .object({
    type: z.enum(['INCOME', 'EXPENDITURE']),
    amount: money,
    category: z.string().trim().min(1, 'Category is required'),
    date: z.coerce.date(),
    // LOAN_FUNDS is retired: historical rows keep it, new entries cannot use it.
    source: z
      .enum(['OWN_POCKET', 'FARM_INCOME'], 'Fund source must be Own Pocket or Farm Income')
      .nullish(),
    notes: optionalText,
    /** Set when one partner records a spend another partner paid for. */
    paidById: z
      .string()
      .nullish()
      .transform((v) => v?.trim() || null),
  })
  .superRefine((d, ctx) => {
    if (d.paidById && d.source !== 'OWN_POCKET') {
      ctx.addIssue({
        code: 'custom',
        path: ['paidById'],
        message: 'Only own-pocket spending can be recorded on another partner\'s behalf',
      });
    }
    if (d.type === 'EXPENDITURE' && !d.source) {
      ctx.addIssue({ code: 'custom', path: ['source'], message: 'Fund source is required on an expenditure' });
    }
    if (d.category === 'OTHER' && !d.notes) {
      ctx.addIssue({ code: 'custom', path: ['notes'], message: 'Notes are required when category is OTHER' });
    }
  })
  // Income is never funded from a pocket or a loan — keep the column clean.
  .transform((d) => ({ ...d, source: d.type === 'INCOME' ? null : d.source ?? null }));

export const loanSchema = z.object({
  amount: money,
  source: z.string().trim().min(1, 'Lender / source is required'),
  description: optionalText,
  date: z.coerce.date(),
  notes: optionalText,
});

export const repaymentSchema = z.object({
  loanId: z.string().trim().min(1, 'Loan is required'),
  amount: money,
  date: z.coerce.date(),
  notes: optionalText,
});

export type LedgerEntryInput = z.infer<typeof ledgerEntrySchema>;
export type LoanInput = z.infer<typeof loanSchema>;
export type RepaymentInput = z.infer<typeof repaymentSchema>;

/**
 * Display labels for every fund source, retired values included — historical
 * entries still render. Keep exhaustive: a missing case previously fell through
 * a binary ternary and mislabelled farm income as loan funds.
 */
export const FUND_SOURCE_LABELS: Record<'OWN_POCKET' | 'FARM_INCOME' | 'LOAN_FUNDS', string> = {
  OWN_POCKET: 'Own Pocket',
  FARM_INCOME: 'Farm Income',
  LOAN_FUNDS: 'Loan Funds',
};

/** Tailwind text colour per fund source. */
export const FUND_SOURCE_STYLES: Record<'OWN_POCKET' | 'FARM_INCOME' | 'LOAN_FUNDS', string> = {
  OWN_POCKET: 'text-blue-600',
  FARM_INCOME: 'text-green-600',
  LOAN_FUNDS: 'text-primary',
};
