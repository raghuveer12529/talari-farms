import { PrismaClient } from '@prisma/client';
import { computeInvoice } from '../src/lib/gst';
import { amountInWords } from '../src/lib/amount-in-words';
import { fyLabel } from '../src/lib/fy';

const prisma = new PrismaClient();

/** Atomic per-FY document number, e.g. TF/26-27/0001 (inline copy of lib). */
async function nextNumber(prefix: string, docType: string, date: Date) {
  const fy = fyLabel(date);
  const id = `${docType}-${fy}`;
  const counter = await prisma.counter.upsert({
    where: { id },
    create: { id, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `${prefix}/${fy}/${String(counter.value).padStart(4, '0')}`;
}

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) throw new Error('No admin user found — run the main seed first.');

  const existing = await prisma.invoice.findFirst({ where: { notes: 'Sample data' } });
  if (existing) {
    console.log('Sample invoices already exist — skipping. (Delete them from the UI to re-seed.)');
    return;
  }

  const settings = await prisma.companySettings.findUnique({ where: { id: 'default' } });
  const prefix = settings?.invoicePrefix ?? 'TF';
  const sellerState = settings?.stateCode ?? '36';

  // ── Products (ensure they exist + have stock) ───────────────
  const fresh = await prisma.product.findUnique({ where: { sku: 'TF-GAC-FRESH' } });
  const powder = await prisma.product.findUnique({ where: { sku: 'TF-GAC-POWDER' } });
  if (!fresh || !powder) throw new Error('Seed products missing — run the main seed first.');

  await prisma.stockMovement.createMany({
    data: [
      { productId: fresh.id, type: 'IN', quantity: 800, reason: 'Opening stock (sample)' },
      { productId: powder.id, type: 'IN', quantity: 300, reason: 'Opening stock (sample)' },
    ],
  });
  console.log('Added opening stock.');

  // ── Customers ───────────────────────────────────────────────
  const customerDefs = [
    {
      companyName: 'NutraVeda Labs Pvt Ltd',
      contactPerson: 'Dr. Anjali Rao',
      gstin: '36AABCN1234M1Z7', // Telangana (36) → intra-state (CGST+SGST)
      email: 'purchase@nutraveda.in',
      phone: '+91 98480 11223',
      billingAddress: 'Plot 45, Genome Valley, Shameerpet, Hyderabad, Telangana 500078',
      industry: 'Nutraceutical',
    },
    {
      companyName: 'Aurora Cosmetics Pvt Ltd',
      contactPerson: 'Meera Iyer',
      gstin: '27AAACA5678P1Z3', // Maharashtra (27) → inter-state (IGST)
      email: 'sourcing@auroracosmetics.com',
      phone: '+91 90040 55667',
      billingAddress: 'Unit 8, MIDC Andheri, Mumbai, Maharashtra 400093',
      industry: 'Cosmetic',
    },
    {
      companyName: 'Himalaya Wellness Foods',
      contactPerson: 'Ravi Menon',
      gstin: '29AAGCH9012Q1Z8', // Karnataka (29) → inter-state (IGST)
      email: 'orders@himwellness.in',
      phone: '+91 99860 33445',
      billingAddress: '12th Cross, Peenya Industrial Area, Bengaluru, Karnataka 560058',
      industry: 'Food & Beverage',
    },
    {
      companyName: 'Sanjeevani Pharma Ltd',
      contactPerson: 'Karthik Reddy',
      gstin: '36AAFCS3456R1Z2', // Telangana (36) → intra-state
      email: 'procure@sanjeevanipharma.in',
      phone: '+91 91210 77889',
      billingAddress: 'Survey 21, Jeedimetla, Hyderabad, Telangana 500055',
      industry: 'Pharmaceutical',
    },
  ];

  const customers = [];
  for (const def of customerDefs) {
    customers.push(await prisma.customer.create({ data: def }));
  }
  console.log(`Created ${customers.length} customers.`);

  // ── Invoices spread across recent months ────────────────────
  // status mix + intra/inter-state + payments
  type Line = { productId: string; description: string; hsnCode: string; unit: string; quantity: number; rate: number; discount: number; gstRate: number };
  const today = new Date();
  const monthsAgo = (m: number, day = 12) => new Date(today.getFullYear(), today.getMonth() - m, day);

  const plan: {
    customerIdx: number;
    monthsAgo: number;
    status: 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID';
    payFraction: number; // 0..1 of grand total
    lines: Line[];
  }[] = [
    { customerIdx: 0, monthsAgo: 5, status: 'PAID', payFraction: 1,
      lines: [{ productId: powder.id, description: powder.name, hsnCode: powder.hsnCode, unit: powder.unit, quantity: 15, rate: 3500, discount: 5, gstRate: 5 }] },
    { customerIdx: 1, monthsAgo: 4, status: 'PAID', payFraction: 1,
      lines: [
        { productId: powder.id, description: powder.name, hsnCode: powder.hsnCode, unit: powder.unit, quantity: 20, rate: 3450, discount: 0, gstRate: 5 },
        { productId: fresh.id, description: fresh.name, hsnCode: fresh.hsnCode, unit: fresh.unit, quantity: 60, rate: 240, discount: 0, gstRate: 0 },
      ] },
    { customerIdx: 2, monthsAgo: 3, status: 'PARTIAL', payFraction: 0.4,
      lines: [{ productId: fresh.id, description: fresh.name, hsnCode: fresh.hsnCode, unit: fresh.unit, quantity: 120, rate: 250, discount: 2, gstRate: 0 }] },
    { customerIdx: 3, monthsAgo: 2, status: 'PAID', payFraction: 1,
      lines: [{ productId: powder.id, description: powder.name, hsnCode: powder.hsnCode, unit: powder.unit, quantity: 10, rate: 3600, discount: 0, gstRate: 5 }] },
    { customerIdx: 0, monthsAgo: 1, status: 'PARTIAL', payFraction: 0.5,
      lines: [
        { productId: powder.id, description: powder.name, hsnCode: powder.hsnCode, unit: powder.unit, quantity: 25, rate: 3500, discount: 3, gstRate: 5 },
        { productId: fresh.id, description: fresh.name, hsnCode: fresh.hsnCode, unit: fresh.unit, quantity: 40, rate: 250, discount: 0, gstRate: 0 },
      ] },
    { customerIdx: 1, monthsAgo: 0, status: 'SENT', payFraction: 0,
      lines: [{ productId: powder.id, description: powder.name, hsnCode: powder.hsnCode, unit: powder.unit, quantity: 18, rate: 3500, discount: 0, gstRate: 5 }] },
    { customerIdx: 2, monthsAgo: 0, status: 'DRAFT', payFraction: 0,
      lines: [{ productId: fresh.id, description: fresh.name, hsnCode: fresh.hsnCode, unit: fresh.unit, quantity: 80, rate: 255, discount: 0, gstRate: 0 }] },
  ];

  let made = 0;
  for (const p of plan) {
    const customer = customers[p.customerIdx];
    const date = monthsAgo(p.monthsAgo);
    const isInterState = !!customer.gstin && customer.gstin.slice(0, 2) !== sellerState.padStart(2, '0');

    const { totals, lineTotals } = computeInvoice(
      p.lines.map((l) => ({ quantity: l.quantity, rate: l.rate, discount: l.discount, gstRate: l.gstRate })),
      isInterState,
    );

    const number = await nextNumber(prefix, 'invoice', date);

    const invoice = await prisma.invoice.create({
      data: {
        number,
        date,
        dueDate: new Date(date.getTime() + 30 * 864e5),
        customerId: customer.id,
        billTo: { companyName: customer.companyName, address: customer.billingAddress, gstin: customer.gstin, phone: customer.phone },
        shipTo: { companyName: customer.companyName, address: customer.billingAddress },
        status: p.status,
        isInterState,
        placeOfSupply: customer.billingAddress?.split(',').slice(-2, -1)[0]?.trim() ?? null,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxableValue: totals.taxableValue,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        grandTotal: totals.grandTotal,
        amountInWords: amountInWords(totals.grandTotal),
        notes: 'Sample data',
        terms: settings?.defaultTerms ?? null,
        createdById: admin.id,
        items: {
          create: p.lines.map((l, i) => ({
            productId: l.productId,
            description: l.description,
            hsnCode: l.hsnCode,
            quantity: l.quantity,
            unit: l.unit,
            rate: l.rate,
            discount: l.discount,
            gstRate: l.gstRate,
            taxableValue: lineTotals[i].taxableValue,
            cgst: lineTotals[i].cgst,
            sgst: lineTotals[i].sgst,
            igst: lineTotals[i].igst,
            amount: lineTotals[i].amount,
          })),
        },
      },
    });

    // Finalized invoices deduct stock.
    if (p.status !== 'DRAFT') {
      for (const l of p.lines) {
        await prisma.stockMovement.create({
          data: { productId: l.productId, type: 'OUT', quantity: l.quantity, reason: `Sold on invoice ${number}`, refType: 'invoice', refId: invoice.id },
        });
      }
    }

    // Payments
    if (p.payFraction > 0) {
      const amount = Math.round(totals.grandTotal * p.payFraction * 100) / 100;
      const receiptNo = await nextNumber('RCPT', 'receipt', date);
      await prisma.payment.create({
        data: {
          receiptNo,
          invoiceId: invoice.id,
          customerId: customer.id,
          amount,
          date: new Date(date.getTime() + 5 * 864e5),
          mode: p.customerIdx % 2 === 0 ? 'BANK_TRANSFER' : 'UPI',
          reference: `TXN${Math.floor(Math.random() * 1e9)}`,
          notes: 'Sample data',
          createdById: admin.id,
        },
      });
    }

    made++;
    console.log(`  ${number}  ${customer.companyName}  ${p.status}  ${isInterState ? 'IGST' : 'CGST+SGST'}  ₹${totals.grandTotal}`);
  }

  console.log(`\nCreated ${made} sample invoices. View them at /app/invoices`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
