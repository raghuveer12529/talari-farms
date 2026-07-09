/**
 * GST computation helpers (Indian tax).
 * Intra-state supply → CGST + SGST (each = rate/2).
 * Inter-state supply → IGST (= full rate).
 */

export interface LineInput {
  quantity: number;
  rate: number;
  /** percent discount on the line (0–100) */
  discount?: number;
  /** GST percent, e.g. 5, 12, 18 */
  gstRate: number;
}

export interface LineTotals {
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  amount: number;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computeLine(line: LineInput, isInterState: boolean): LineTotals {
  const gross = line.quantity * line.rate;
  const discountAmt = gross * ((line.discount ?? 0) / 100);
  const taxableValue = round2(gross - discountAmt);
  const taxTotal = round2(taxableValue * (line.gstRate / 100));

  const igst = isInterState ? taxTotal : 0;
  const cgst = isInterState ? 0 : round2(taxTotal / 2);
  const sgst = isInterState ? 0 : round2(taxTotal - cgst);

  return {
    taxableValue,
    cgst,
    sgst,
    igst,
    amount: round2(taxableValue + cgst + sgst + igst),
  };
}

export interface InvoiceTotals {
  subtotal: number; // sum of gross (qty*rate) before discount
  discountTotal: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
}

export function computeInvoice(lines: LineInput[], isInterState: boolean): {
  totals: InvoiceTotals;
  lineTotals: LineTotals[];
} {
  const lineTotals = lines.map((l) => computeLine(l, isInterState));

  let subtotal = 0;
  let discountTotal = 0;
  const totals: InvoiceTotals = {
    subtotal: 0,
    discountTotal: 0,
    taxableValue: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    grandTotal: 0,
  };

  lines.forEach((l, i) => {
    const gross = l.quantity * l.rate;
    subtotal += gross;
    discountTotal += gross * ((l.discount ?? 0) / 100);
    totals.taxableValue += lineTotals[i].taxableValue;
    totals.cgst += lineTotals[i].cgst;
    totals.sgst += lineTotals[i].sgst;
    totals.igst += lineTotals[i].igst;
  });

  totals.subtotal = round2(subtotal);
  totals.discountTotal = round2(discountTotal);
  totals.taxableValue = round2(totals.taxableValue);
  totals.cgst = round2(totals.cgst);
  totals.sgst = round2(totals.sgst);
  totals.igst = round2(totals.igst);
  totals.grandTotal = round2(
    totals.taxableValue + totals.cgst + totals.sgst + totals.igst,
  );

  return { totals, lineTotals };
}

/**
 * Whether a supply is inter-state, by comparing the seller's and buyer's
 * GST state codes (first 2 digits of the GSTIN). Defaults to intra-state when
 * either code is missing.
 */
export function isInterStateSupply(
  sellerStateCode?: string | null,
  buyerGstin?: string | null,
): boolean {
  if (!sellerStateCode || !buyerGstin || buyerGstin.length < 2) return false;
  return sellerStateCode.padStart(2, '0') !== buyerGstin.slice(0, 2);
}
