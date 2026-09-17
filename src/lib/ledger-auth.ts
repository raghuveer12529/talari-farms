import type { ZodError } from 'zod';

/** Result contract for ledger server actions, mirroring the ERP actions. */
export type LedgerResult = { ok: true } | { ok: false; error: string };

/**
 * Only partners and admins may write to the partner ledger. Every other role
 * (VIEWER, SALES, …) exists for the ERP and has no business here.
 */
export function assertLedgerWriter(role: string | undefined): boolean {
  return role === 'ADMIN' || role === 'PARTNER';
}

/** First human-readable validation message from a Zod error. */
export function firstError(error: ZodError): string {
  return error.issues[0]?.message ?? 'Invalid data';
}

/**
 * Who may delete a ledger entry: an admin, the partner the money is credited
 * to, or the partner who recorded it (so a typo can be undone by whoever made
 * it). Legacy rows have no recorder and fall back to the credited partner.
 */
export function canDeleteEntry(
  user: { id: string; role?: string },
  entry: { partnerId: string; recordedById: string | null },
): boolean {
  if (user.role === 'ADMIN') return true;
  return entry.partnerId === user.id || entry.recordedById === user.id;
}
