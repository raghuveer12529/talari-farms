# Analytics & GST Reporting — Design

**Date:** 2026-07-11
**Status:** Approved (design)
**Scope:** New internal-facing "Reports" section in the Talari Farms ERP (`/app/*`)
covering deeper sales analytics and GSTR-1 filing output.

## Goal

Turn the ERP's already-captured invoice/payment data into decision-useful
analytics and GST-filing output for the internal team. The feature is
**read-only over existing data** — no schema changes, no migrations.

Audience: internal team only, function-first (polish is secondary).

## Context (what already exists)

- Server-rendered ERP under `/app/*`, NextAuth + RBAC via `src/lib/permissions.ts`.
- Money stored as Prisma `Decimal` on ERP models; converted to numbers in the
  view layer via `toNum` (`src/lib/serialize.ts`).
- GST computation helpers in `src/lib/gst.ts` (`computeInvoice`, `computeLine`,
  `isInterStateSupply`, `round2`) with tests in `gst.test.ts`.
- Indian financial-year helpers in `src/lib/fy.ts` (`financialYear`, `fyLabel`)
  with tests in `fy.test.ts`.
- Existing dashboard (`src/app/app/page.tsx`) already shows headline revenue,
  6-month revenue trend, top products, pending invoices, low stock. **This
  feature does not re-do those** — it adds what is missing.
- Persisted per-item tax columns on `InvoiceItem` (`taxableValue`, `cgst`,
  `sgst`, `igst`) and on `Invoice`, computed at invoice-creation time.
- Formatting helpers: `formatINR`, `formatDate`, `formatNumber`
  (`src/lib/format.ts`). Reusable UI: `PageHeader`, `StatCard`, `Card`,
  `Badge`, `InvoiceStatusBadge`, `DashboardCharts` (`recharts`).

## Chosen approach

**Server-rendered `/app/reports` section, URL-driven period filter, backed by a
pure aggregation layer.** All money/GST math stays server-side in pure,
unit-tested functions (mirroring `gst.ts`/`fy.ts`). Rejected alternatives:
client-side analytics (duplicates money math, drift risk) and pre-aggregated
summary tables (premature; data volume is hundreds of invoices).

## Architecture

### 1. Data & aggregation layer (pure, testable)

**`src/lib/period.ts`** — owns "what date window are we looking at."
- Parses a period from URL search params into `{ from: Date; to: Date; label: string }`.
- Modes: `fy=26-27`, `month=2026-06`, `range=2026-04-01..2026-06-30`.
- Defaults to the current financial year via `financialYear()`.

**`src/lib/reports/` — pure functions, each independently testable.** Each takes
already-fetched Prisma rows (invoices with `items` + `payments`) so pages own the
query and functions stay mockable. `Decimal` → number conversion happens once via
`toNum`; functions return plain numbers.
- `sales.ts` → `salesBreakdown(invoices, opts)`: totals + groupings by customer,
  product, category, and state (place of supply / bill-to).
- `margin.ts` → `marginReport(invoices)`: revenue vs COGS using
  `InvoiceItem` × product `costPrice`; gross margin overall / per-product /
  per-invoice. Items with no linked `productId` are treated as cost 0 **and
  flagged** (ad-hoc/service lines).
- `aging.ts` → `arAging(invoices, asOf)`: per-invoice balance
  (`grandTotal` − payments) bucketed 0–30 / 31–60 / 61–90 / 90+ by `dueDate`
  (fallback `date`); per-customer rollup; collection efficiency
  (received ÷ invoiced). Fully-paid invoices excluded.
- `gst-liability.ts` → `gstLiability(invoices)`: taxable value, CGST, SGST, IGST
  totals for the period.

### 2. Analytics pages & navigation

- Add one "Reports" item to the ERP sidebar (`src/app/app/layout.tsx`) → `/app/reports`.
- Add `'reports'` to the `ErpModule` union in `src/lib/permissions.ts`. View
  access follows the existing rule (anyone with ERP access may view every
  module); no new permission concept.

**`src/components/erp/PeriodFilter.tsx`** (the only client component in the
analytics half): FY / Month / Custom-range modes; updates URL search params via
`router.push`, triggering a server re-render.

**`src/app/app/reports/page.tsx`** (server component): reads period from search
params, fetches in-range invoices once, feeds all four aggregators, renders:
1. **KPI row** (`StatCard`): Revenue, Gross Margin %, Outstanding (AR),
   Collection efficiency — scoped to the period.
2. **Profit & margin**: product table (revenue, COGS, margin ₹, margin %),
   ad-hoc/no-cost lines flagged; small bar chart of top/bottom margin products.
3. **AR aging**: four bucket cards + per-customer table sorted by amount due.
4. **Sales breakdowns**: segmented table by Customer / Product / Category / State,
   sortable by amount.
5. **GST liability**: compact card (taxable value, CGST, SGST, IGST, total tax)
   with "View GSTR-1 →" link to `/app/reports/gst`.

**CSV export:** each table gets a "Download CSV" button backed by `src/lib/csv.ts`
+ a route handler `src/app/app/reports/export/[report]/route.ts` that regenerates
the aggregate server-side from the same period params and streams CSV. No
client-side money math.

### 3. GSTR-1 report & exports

**`src/app/app/reports/gst/page.tsx`** — filing view for one **return period**
(month picker, defaults to last month, since GSTR-1 is monthly). Reads seller
GSTIN + state code from `CompanySettings`, fetches the month's non-cancelled
invoices, runs the builder.

**`src/lib/gst-return.ts`** (pure, unit-tested) → `Gstr1Return` with sections:
- **B2B** — customers with a GSTIN; grouped by counterparty GSTIN → invoices →
  rate-wise line rollups; place-of-supply, reverse-charge = N, type = Regular.
- **B2CS** — customers without GSTIN (not B2CL); aggregated rate-wise by
  place-of-supply + rate.
- **B2CL** — inter-state, unregistered, invoice value > `B2CL_THRESHOLD`
  (named constant = ₹1,00,000; easy to update). Often empty for a B2B farm, but
  handled rather than silently dropped.
- **HSN summary** — grouped by `hsnCode` + rate: total qty, UQC (unit), total
  value, taxable value, tax amounts. HSN from `InvoiceItem.hsnCode`, falling back
  to product `hsnCode`.
- **Document summary** — invoice number range(s), total count, cancelled count.

**Place-of-supply state code:** derived from buyer GSTIN (first 2 digits) when
present, else mapped from `placeOfSupply` via a new `src/lib/gst-states.ts`
`STATE_CODES` map. Invoices whose POS cannot be resolved appear in a
**"needs attention" list** on the page (never silently omitted).

**Exports:**
1. **CSV** — one download per section (B2B, B2CS, HSN, docs) via `csv.ts`.
2. **GSTR-1 JSON** — `src/lib/gstr1-json.ts` serializes `Gstr1Return` into the
   government offline-tool schema (`gstin`, `fp` = `MMYYYY`, `b2b`, `b2cs`,
   `b2cl`, `hsn`, `doc_issue`). Served via
   `src/app/app/reports/gst/export/route.ts` as a downloadable `.json`.

**Correctness guardrail:** all tax figures come from the persisted per-item
`Decimal` columns; the builder only **groups and sums**, never re-derives tax, so
the return reconciles to the actual invoices.

## Testing (vitest, no DB — matches existing `*.test.ts`)

- `period.test.ts` — FY/month/range parsing, current-FY default, Mar 31 vs Apr 1.
- `reports/margin.test.ts` — margin math, zero-cost/no-`productId` flagging,
  revenue = 0 (no divide-by-zero).
- `reports/aging.test.ts` — bucket boundaries (30/60/90), missing-`dueDate`
  fallback, partial payments, fully-paid excluded.
- `reports/sales.test.ts` — grouping/sum correctness across all four dimensions.
- `reports/gst-liability.test.ts` — intra- vs inter-state mix.
- `gst-return.test.ts` — B2B/B2CS/B2CL classification, B2CL threshold, HSN
  rollup, cancelled-in-doc-summary, unresolved-POS path.
- `gstr1-json.test.ts` — golden-fixture invoices → asserts emitted JSON matches
  the government schema shape.

## Change map

**New files**
- `src/lib/period.ts`, `src/lib/csv.ts`, `src/lib/gst-states.ts`
- `src/lib/reports/{sales,margin,aging,gst-liability}.ts`
- `src/lib/gst-return.ts`, `src/lib/gstr1-json.ts`
- `src/app/app/reports/page.tsx`
- `src/app/app/reports/gst/page.tsx`
- `src/app/app/reports/export/[report]/route.ts`
- `src/app/app/reports/gst/export/route.ts`
- `src/components/erp/PeriodFilter.tsx`
- test files listed above

**Edited**
- `src/app/app/layout.tsx` — add "Reports" nav item
- `src/lib/permissions.ts` — add `'reports'` to `ErpModule`
- `src/components/erp/DashboardCharts.tsx` — only if a chart cleanly reuses

**Not touched:** invoice creation, schema/migrations, payments. Read-only feature.

## Out of scope (YAGNI)

- Client-side interactive analytics.
- Pre-aggregated summary tables / refresh jobs.
- E-invoicing (IRN/QR), GSTR-3B, e-way bills.
- PDF export of analytics (CSV is sufficient for internal use).
- Any change to how invoices compute tax.
