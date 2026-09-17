import { describe, it, expect } from 'vitest';
import { canDeleteEntry, assertLedgerWriter } from '@/lib/ledger-auth';

const ADMIN = { id: 'u-admin', role: 'ADMIN' };
const SURESH = { id: 'u-suresh', role: 'PARTNER' };
const MAHESH = { id: 'u-mahesh', role: 'PARTNER' };
const RAGHU = { id: 'u-raghu', role: 'PARTNER' };

// Mahesh typed in an entry for money Suresh paid from his own pocket.
const onBehalf = { partnerId: SURESH.id, recordedById: MAHESH.id };
// An ordinary entry someone made for themselves (legacy rows have no recorder).
const selfMade = { partnerId: SURESH.id, recordedById: null };

describe('canDeleteEntry', () => {
  it('lets the partner the money is credited to delete it', () => {
    expect(canDeleteEntry(SURESH, onBehalf)).toBe(true);
  });

  it('lets the partner who recorded it delete it', () => {
    expect(canDeleteEntry(MAHESH, onBehalf)).toBe(true);
  });

  it('does not let an uninvolved partner delete it', () => {
    expect(canDeleteEntry(RAGHU, onBehalf)).toBe(false);
  });

  it('lets an admin delete anything', () => {
    expect(canDeleteEntry(ADMIN, onBehalf)).toBe(true);
  });

  it('lets the owner delete a legacy entry with no recorder', () => {
    expect(canDeleteEntry(SURESH, selfMade)).toBe(true);
  });

  it('does not let a bystander delete a legacy entry', () => {
    expect(canDeleteEntry(MAHESH, selfMade)).toBe(false);
  });
});

describe('assertLedgerWriter', () => {
  it('allows partners and admins', () => {
    expect(assertLedgerWriter('PARTNER')).toBe(true);
    expect(assertLedgerWriter('ADMIN')).toBe(true);
  });

  it('rejects ERP-only roles and missing roles', () => {
    expect(assertLedgerWriter('VIEWER')).toBe(false);
    expect(assertLedgerWriter('SALES')).toBe(false);
    expect(assertLedgerWriter(undefined)).toBe(false);
  });
});
