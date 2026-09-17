import { describe, it, expect } from 'vitest';
import { ledgerEntrySchema, loanSchema, repaymentSchema, FUND_SOURCE_LABELS } from '@/lib/ledger-schemas';

const validEntry = {
  type: 'EXPENDITURE',
  amount: '1250.50',
  category: 'SEEDS',
  date: '2026-07-01',
  source: 'OWN_POCKET',
  notes: null,
};

describe('ledgerEntrySchema', () => {
  it('accepts a valid expenditure and coerces the amount to a number', () => {
    const parsed = ledgerEntrySchema.parse(validEntry);
    expect(parsed.amount).toBe(1250.5);
    expect(parsed.date).toEqual(new Date('2026-07-01'));
  });

  it('rejects a zero amount', () => {
    const r = ledgerEntrySchema.safeParse({ ...validEntry, amount: '0' });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].message).toMatch(/positive/i);
  });

  it('rejects a negative amount', () => {
    expect(ledgerEntrySchema.safeParse({ ...validEntry, amount: '-5' }).success).toBe(false);
  });

  it('rejects a non-numeric amount instead of storing NaN', () => {
    const r = ledgerEntrySchema.safeParse({ ...validEntry, amount: 'abc' });
    expect(r.success).toBe(false);
  });

  it('rejects an empty amount', () => {
    expect(ledgerEntrySchema.safeParse({ ...validEntry, amount: '' }).success).toBe(false);
  });

  it('rejects an amount that overflows Decimal(12,2)', () => {
    const r = ledgerEntrySchema.safeParse({ ...validEntry, amount: '10000000000' });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].message).toMatch(/too large/i);
  });

  it('rejects more than two decimal places rather than letting the database round', () => {
    const r = ledgerEntrySchema.safeParse({ ...validEntry, amount: '10.125' });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].message).toMatch(/paise|decimal/i);
  });

  it('rejects an unparseable date', () => {
    expect(ledgerEntrySchema.safeParse({ ...validEntry, date: 'not-a-date' }).success).toBe(false);
  });

  it('rejects an unknown entry type', () => {
    expect(ledgerEntrySchema.safeParse({ ...validEntry, type: 'TRANSFER' }).success).toBe(false);
  });

  it('requires a fund source on an expenditure', () => {
    const r = ledgerEntrySchema.safeParse({ ...validEntry, source: null });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].message).toMatch(/source/i);
  });

  it('accepts an expenditure funded from farm income', () => {
    const parsed = ledgerEntrySchema.parse({ ...validEntry, source: 'FARM_INCOME' });
    expect(parsed.source).toBe('FARM_INCOME');
  });

  it('rejects LOAN_FUNDS on a new entry — loans are a liability, not a spendable pool', () => {
    const r = ledgerEntrySchema.safeParse({ ...validEntry, source: 'LOAN_FUNDS' });
    expect(r.success).toBe(false);
  });

  it('forces source to null on income', () => {
    const parsed = ledgerEntrySchema.parse({ ...validEntry, type: 'INCOME', source: 'OWN_POCKET' });
    expect(parsed.source).toBeNull();
  });

  it('requires notes when the category is OTHER', () => {
    const r = ledgerEntrySchema.safeParse({ ...validEntry, category: 'OTHER', notes: '   ' });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].message).toMatch(/notes/i);
  });

  it('accepts OTHER when notes are supplied', () => {
    const parsed = ledgerEntrySchema.parse({ ...validEntry, category: 'OTHER', notes: 'Diesel top-up' });
    expect(parsed.notes).toBe('Diesel top-up');
  });

  it('normalises blank notes to null', () => {
    expect(ledgerEntrySchema.parse({ ...validEntry, notes: '  ' }).notes).toBeNull();
  });

  it('rejects a blank category', () => {
    expect(ledgerEntrySchema.safeParse({ ...validEntry, category: '' }).success).toBe(false);
  });
});

describe('ledgerEntrySchema — recording on another partner\'s behalf', () => {
  it('accepts paidById on an own-pocket expenditure', () => {
    const parsed = ledgerEntrySchema.parse({ ...validEntry, source: 'OWN_POCKET', paidById: 'partner-suresh' });
    expect(parsed.paidById).toBe('partner-suresh');
  });

  it('leaves paidById undefined when not supplied', () => {
    expect(ledgerEntrySchema.parse(validEntry).paidById).toBeNull();
  });

  it('rejects paidById when the money came from farm income', () => {
    const r = ledgerEntrySchema.safeParse({ ...validEntry, source: 'FARM_INCOME', paidById: 'partner-suresh' });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].message).toMatch(/own[- ]pocket/i);
  });

  it('rejects paidById on an income entry', () => {
    const r = ledgerEntrySchema.safeParse({ ...validEntry, type: 'INCOME', source: null, paidById: 'partner-suresh' });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].message).toMatch(/own[- ]pocket/i);
  });

  it('treats a blank paidById as not supplied', () => {
    expect(ledgerEntrySchema.parse({ ...validEntry, paidById: '' }).paidById).toBeNull();
  });
});

describe('loanSchema', () => {
  const validLoan = { amount: '50000', source: 'HDFC Bank', description: null, date: '2026-07-01', notes: null };

  it('accepts a valid loan', () => {
    expect(loanSchema.parse(validLoan).amount).toBe(50000);
  });

  it('rejects a non-positive amount', () => {
    expect(loanSchema.safeParse({ ...validLoan, amount: '0' }).success).toBe(false);
  });

  it('requires a lender source', () => {
    const r = loanSchema.safeParse({ ...validLoan, source: '  ' });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].message).toMatch(/lender|source/i);
  });
});

describe('repaymentSchema', () => {
  const validRepayment = { loanId: 'clx123', amount: '2500', date: '2026-07-01', notes: null };

  it('accepts a valid repayment', () => {
    expect(repaymentSchema.parse(validRepayment).amount).toBe(2500);
  });

  it('requires a loan id', () => {
    expect(repaymentSchema.safeParse({ ...validRepayment, loanId: '' }).success).toBe(false);
  });

  it('rejects a non-numeric amount', () => {
    expect(repaymentSchema.safeParse({ ...validRepayment, amount: 'abc' }).success).toBe(false);
  });
});

describe('FUND_SOURCE_LABELS', () => {
  it('has a label for every fund source, including retired ones', () => {
    // Guards the display bug where a third source fell through a binary
    // ternary and rendered as "Loan Funds".
    for (const source of ['OWN_POCKET', 'FARM_INCOME', 'LOAN_FUNDS'] as const) {
      expect(FUND_SOURCE_LABELS[source]).toBeTruthy();
    }
  });

  it('does not label farm income as loan funds', () => {
    expect(FUND_SOURCE_LABELS.FARM_INCOME).not.toMatch(/loan/i);
  });
});
