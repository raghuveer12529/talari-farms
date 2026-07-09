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
