import { describe, it, expect } from 'vitest';
import { financialYear, fyLabel } from './fy';

describe('financial year (Apr–Mar)', () => {
  it('treats April as the start of a new FY', () => {
    expect(financialYear(new Date(2026, 3, 1))).toEqual({ startYear: 2026, endYear: 2027 });
    expect(fyLabel(new Date(2026, 3, 1))).toBe('26-27');
  });

  it('treats Jan–Mar as the previous FY', () => {
    expect(financialYear(new Date(2026, 2, 31))).toEqual({ startYear: 2025, endYear: 2026 });
    expect(fyLabel(new Date(2026, 2, 31))).toBe('25-26');
  });

  it('mid-year date resolves correctly', () => {
    expect(fyLabel(new Date(2026, 5, 30))).toBe('26-27'); // June 2026
    expect(fyLabel(new Date(2025, 11, 25))).toBe('25-26'); // Dec 2025
  });
});
