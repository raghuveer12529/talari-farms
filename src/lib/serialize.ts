import { Prisma } from '@prisma/client';

/**
 * Convert a Prisma Decimal (money field) to a plain number. Use at the
 * server boundary before doing arithmetic or passing values to client
 * components (Decimal instances are not serializable across the RSC boundary).
 */
export function toNum(v: Prisma.Decimal | number | null | undefined): number {
  if (v == null) return 0;
  return typeof v === 'number' ? v : v.toNumber();
}

/**
 * Return a copy of a row with its Decimal `amount` as a plain number. Use at
 * the page boundary so ledger totals stay ordinary arithmetic and rows remain
 * serializable across the RSC boundary.
 */
export function toPlainAmount<T extends { amount: Prisma.Decimal | number }>(
  row: T,
): Omit<T, 'amount'> & { amount: number } {
  return { ...row, amount: toNum(row.amount) };
}
