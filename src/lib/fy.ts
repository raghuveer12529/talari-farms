/**
 * Indian financial year helpers. FY runs April 1 → March 31.
 * e.g. a date in June 2026 → FY "26-27".
 */
export function financialYear(date: Date = new Date()): { startYear: number; endYear: number } {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan
  const startYear = month >= 3 ? year : year - 1; // Apr (3) onwards is current FY
  return { startYear, endYear: startYear + 1 };
}

/** "26-27" style label for the given date's financial year. */
export function fyLabel(date: Date = new Date()): string {
  const { startYear, endYear } = financialYear(date);
  return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
}
