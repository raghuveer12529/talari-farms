import { describe, it, expect } from 'vitest';
import { farmFundsAvailable, exceedsPool, incomeDeletionOverdraws } from '@/lib/ledger-pools';

describe('farmFundsAvailable', () => {
  it('is income minus what has already been spent from farm funds', () => {
    expect(farmFundsAvailable(446000, 167000)).toBe(279000);
  });

  it('is zero when nothing has been earned', () => {
    expect(farmFundsAvailable(0, 0)).toBe(0);
  });

  it('does not accumulate float drift across paise', () => {
    expect(farmFundsAvailable(0.3, 0.1)).toBe(0.2);
  });

  it('can report a negative pool if history already overdrew it', () => {
    expect(farmFundsAvailable(100, 250)).toBe(-150);
  });
});

describe('exceedsPool', () => {
  it('allows an amount below the pool', () => {
    expect(exceedsPool(100, 500)).toBe(false);
  });

  it('allows spending the pool to exactly zero', () => {
    expect(exceedsPool(500, 500)).toBe(false);
  });

  it('allows an exact match despite float representation', () => {
    expect(exceedsPool(0.1 + 0.2, 0.3)).toBe(false);
  });

  it('rejects an amount one paisa over the pool', () => {
    expect(exceedsPool(500.01, 500)).toBe(true);
  });

  it('rejects any spend against an empty pool', () => {
    expect(exceedsPool(0.01, 0)).toBe(true);
  });
});

describe('incomeDeletionOverdraws', () => {
  it('allows deleting income that is still unspent', () => {
    expect(incomeDeletionOverdraws(446000, 167000, 100000)).toBe(false);
  });

  it('allows a deletion that lands exactly on zero', () => {
    expect(incomeDeletionOverdraws(446000, 346000, 100000)).toBe(false);
  });

  it('blocks a deletion that would push the pool negative', () => {
    expect(incomeDeletionOverdraws(446000, 400000, 100000)).toBe(true);
  });

  it('blocks deleting the only income once any of it is spent', () => {
    expect(incomeDeletionOverdraws(1000, 1, 1000)).toBe(true);
  });
});
