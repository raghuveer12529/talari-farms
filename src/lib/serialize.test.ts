import { describe, it, expect } from 'vitest';
import { Prisma } from '@prisma/client';
import { toNum, toPlainAmount } from '@/lib/serialize';

describe('toNum', () => {
  it('converts a Decimal to a number', () => {
    expect(toNum(new Prisma.Decimal('1250.50'))).toBe(1250.5);
  });

  it('passes a number through', () => {
    expect(toNum(12.5)).toBe(12.5);
  });

  it('treats null and undefined as zero', () => {
    expect(toNum(null)).toBe(0);
    expect(toNum(undefined)).toBe(0);
  });
});

describe('toPlainAmount', () => {
  it('replaces a Decimal amount with a number, keeping the other fields', () => {
    const row = { id: 'a1', category: 'SEEDS', amount: new Prisma.Decimal('99.99') };
    const plain = toPlainAmount(row);
    expect(plain).toEqual({ id: 'a1', category: 'SEEDS', amount: 99.99 });
    expect(typeof plain.amount).toBe('number');
  });

  it('does not mutate the original row', () => {
    const row = { id: 'a1', amount: new Prisma.Decimal('5') };
    toPlainAmount(row);
    expect(row.amount).toBeInstanceOf(Prisma.Decimal);
  });
});
