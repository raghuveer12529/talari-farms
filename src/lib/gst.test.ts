import { describe, it, expect } from 'vitest';
import { computeLine, computeInvoice, isInterStateSupply, round2 } from './gst';

describe('round2', () => {
  it('rounds to 2 decimals', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.675)).toBe(2.68);
    expect(round2(100)).toBe(100);
  });
});

describe('computeLine — intra-state (CGST + SGST)', () => {
  it('splits GST into equal CGST and SGST halves', () => {
    const r = computeLine({ quantity: 10, rate: 100, gstRate: 18 }, false);
    expect(r.taxableValue).toBe(1000);
    expect(r.cgst).toBe(90);
    expect(r.sgst).toBe(90);
    expect(r.igst).toBe(0);
    expect(r.amount).toBe(1180);
  });

  it('applies line discount before tax', () => {
    const r = computeLine({ quantity: 10, rate: 100, discount: 10, gstRate: 18 }, false);
    expect(r.taxableValue).toBe(900);
    expect(r.cgst).toBe(81);
    expect(r.sgst).toBe(81);
    expect(r.amount).toBe(1062);
  });

  it('handles 0% GST (fresh produce)', () => {
    const r = computeLine({ quantity: 50, rate: 250, gstRate: 0 }, false);
    expect(r.taxableValue).toBe(12500);
    expect(r.cgst).toBe(0);
    expect(r.sgst).toBe(0);
    expect(r.igst).toBe(0);
    expect(r.amount).toBe(12500);
  });
});

describe('computeLine — inter-state (IGST)', () => {
  it('puts full tax in IGST, none in CGST/SGST', () => {
    const r = computeLine({ quantity: 10, rate: 3500, discount: 5, gstRate: 5 }, true);
    expect(r.taxableValue).toBe(33250); // 35000 - 5%
    expect(r.igst).toBe(1662.5);
    expect(r.cgst).toBe(0);
    expect(r.sgst).toBe(0);
    expect(r.amount).toBe(34912.5);
  });
});

describe('computeInvoice — multi-line totals', () => {
  it('aggregates inter-state invoice (powder 5% + fresh 0%)', () => {
    const { totals } = computeInvoice(
      [
        { quantity: 10, rate: 3500, discount: 5, gstRate: 5 },
        { quantity: 50, rate: 250, discount: 0, gstRate: 0 },
      ],
      true,
    );
    expect(totals.subtotal).toBe(47500);
    expect(totals.discountTotal).toBe(1750);
    expect(totals.taxableValue).toBe(45750);
    expect(totals.igst).toBe(1662.5);
    expect(totals.cgst).toBe(0);
    expect(totals.sgst).toBe(0);
    expect(totals.grandTotal).toBe(47412.5);
  });

  it('aggregates intra-state invoice with CGST + SGST', () => {
    const { totals } = computeInvoice([{ quantity: 4, rate: 1000, gstRate: 12 }], false);
    expect(totals.taxableValue).toBe(4000);
    expect(totals.cgst).toBe(240);
    expect(totals.sgst).toBe(240);
    expect(totals.igst).toBe(0);
    expect(totals.grandTotal).toBe(4480);
  });
});

describe('isInterStateSupply', () => {
  it('is inter-state when state codes differ', () => {
    expect(isInterStateSupply('36', '27ABCDE1234F1Z5')).toBe(true); // TG seller, MH buyer
  });
  it('is intra-state when state codes match', () => {
    expect(isInterStateSupply('36', '36AAZFT3406A1Z5')).toBe(false);
  });
  it('defaults to intra-state when data is missing', () => {
    expect(isInterStateSupply(null, '27ABcd')).toBe(false);
    expect(isInterStateSupply('36', null)).toBe(false);
    expect(isInterStateSupply('36', '2')).toBe(false);
  });
  it('pads single-digit seller state codes', () => {
    expect(isInterStateSupply('6', '06XXXXX')).toBe(false); // Haryana both
    expect(isInterStateSupply('6', '27XXXXX')).toBe(true);
  });
});
