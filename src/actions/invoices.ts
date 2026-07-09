'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { assertCan, type Role } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';
import { computeInvoice } from '@/lib/gst';
import { amountInWords } from '@/lib/amount-in-words';
import { nextDocNumber } from '@/lib/invoice-number';
import { getCompanySettings } from '@/lib/settings';

const itemSchema = z.object({
  productId: z.string().optional().nullable(),
  description: z.string().min(1, 'Item description is required'),
  hsnCode: z.string().optional().nullable(),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unit: z.string().min(1),
  rate: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).max(100),
  gstRate: z.coerce.number().min(0).max(100),
});

const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Select a customer'),
  date: z.string().min(1),
  dueDate: z.string().optional().nullable(),
  isInterState: z.boolean(),
  placeOfSupply: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1, 'Add at least one line item'),
});

export type InvoiceItemInput = z.infer<typeof itemSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;

type Result = { ok: true; id?: string } | { ok: false; error: string };

async function authorize() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: 'Unauthorized' };
  try {
    assertCan(session.user.role as Role, 'invoices');
    return { ok: true as const, userId: session.user.id };
  } catch {
    return { ok: false as const, error: 'You do not have permission to manage invoices.' };
  }
}

function snapshotCustomer(c: {
  companyName: string;
  billingAddress: string | null;
  shippingAddress: string | null;
  gstin: string | null;
  pan: string | null;
  email: string | null;
  phone: string | null;
}) {
  return {
    billTo: {
      companyName: c.companyName,
      address: c.billingAddress ?? '',
      gstin: c.gstin ?? '',
      pan: c.pan ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
    },
    shipTo: {
      companyName: c.companyName,
      address: c.shippingAddress || c.billingAddress || '',
    },
  };
}

function buildItemRows(items: InvoiceItemInput[], isInterState: boolean) {
  const { totals, lineTotals } = computeInvoice(
    items.map((i) => ({ quantity: i.quantity, rate: i.rate, discount: i.discount, gstRate: i.gstRate })),
    isInterState,
  );
  const itemRows = items.map((i, idx) => ({
    productId: i.productId || null,
    description: i.description,
    hsnCode: i.hsnCode || null,
    quantity: i.quantity,
    unit: i.unit,
    rate: i.rate,
    discount: i.discount,
    gstRate: i.gstRate,
    taxableValue: lineTotals[idx].taxableValue,
    cgst: lineTotals[idx].cgst,
    sgst: lineTotals[idx].sgst,
    igst: lineTotals[idx].igst,
    amount: lineTotals[idx].amount,
  }));
  return { totals, itemRows };
}

export async function createInvoice(input: InvoiceInput): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' };
  const d = parsed.data;

  const [customer, settings] = await Promise.all([
    prisma.customer.findUnique({ where: { id: d.customerId } }),
    getCompanySettings(),
  ]);
  if (!customer) return { ok: false, error: 'Customer not found' };

  const { totals, itemRows } = buildItemRows(d.items, d.isInterState);
  const snap = snapshotCustomer(customer);
  const date = new Date(d.date);

  const invoice = await prisma.$transaction(async (tx) => {
    const number = await nextDocNumber(settings.invoicePrefix, 'invoice', date, tx);
    return tx.invoice.create({
      data: {
        number,
        date,
        dueDate: d.dueDate ? new Date(d.dueDate) : null,
        customerId: d.customerId,
        billTo: snap.billTo,
        shipTo: snap.shipTo,
        status: 'DRAFT',
        isInterState: d.isInterState,
        placeOfSupply: d.placeOfSupply || null,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxableValue: totals.taxableValue,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        grandTotal: totals.grandTotal,
        amountInWords: amountInWords(totals.grandTotal),
        notes: d.notes || null,
        terms: d.terms || settings.defaultTerms || null,
        createdById: authz.userId,
        items: { create: itemRows },
      },
    });
  });

  await logAudit({ action: 'invoice.create', entity: 'Invoice', entityId: invoice.id, summary: `Created invoice ${invoice.number} (₹${totals.grandTotal})` });
  revalidatePath('/app/invoices');
  revalidatePath('/app');
  return { ok: true, id: invoice.id };
}

export async function updateInvoice(id: string, input: InvoiceInput): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: 'Invoice not found' };
  if (existing.status !== 'DRAFT') {
    return { ok: false, error: 'Only draft invoices can be edited.' };
  }

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' };
  const d = parsed.data;

  const customer = await prisma.customer.findUnique({ where: { id: d.customerId } });
  if (!customer) return { ok: false, error: 'Customer not found' };

  const { totals, itemRows } = buildItemRows(d.items, d.isInterState);
  const snap = snapshotCustomer(customer);

  await prisma.$transaction(async (tx) => {
    await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
    await tx.invoice.update({
      where: { id },
      data: {
        date: new Date(d.date),
        dueDate: d.dueDate ? new Date(d.dueDate) : null,
        customerId: d.customerId,
        billTo: snap.billTo,
        shipTo: snap.shipTo,
        isInterState: d.isInterState,
        placeOfSupply: d.placeOfSupply || null,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxableValue: totals.taxableValue,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        grandTotal: totals.grandTotal,
        amountInWords: amountInWords(totals.grandTotal),
        notes: d.notes || null,
        terms: d.terms || null,
        items: { create: itemRows },
      },
    });
  });

  await logAudit({ action: 'invoice.update', entity: 'Invoice', entityId: id, summary: `Updated draft invoice ${existing.number}` });
  revalidatePath('/app/invoices');
  revalidatePath(`/app/invoices/${id}`);
  return { ok: true, id };
}

/** Finalize a draft: mark SENT and deduct stock for line items linked to products. */
export async function finalizeInvoice(id: string): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { items: true } });
  if (!invoice) return { ok: false, error: 'Invoice not found' };
  if (invoice.status !== 'DRAFT') return { ok: false, error: 'Invoice is already finalized.' };

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({ where: { id }, data: { status: 'SENT' } });
    for (const item of invoice.items) {
      if (item.productId) {
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            reason: `Sold on invoice ${invoice.number}`,
            refType: 'invoice',
            refId: invoice.id,
          },
        });
      }
    }
  });

  await logAudit({ action: 'invoice.finalize', entity: 'Invoice', entityId: id, summary: `Finalized invoice ${invoice.number}` });
  revalidatePath('/app/invoices');
  revalidatePath(`/app/invoices/${id}`);
  revalidatePath('/app/inventory');
  revalidatePath('/app');
  return { ok: true, id };
}

/** Cancel an invoice, reversing any stock that was deducted. Blocked if payments exist. */
export async function cancelInvoice(id: string): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true, payments: true },
  });
  if (!invoice) return { ok: false, error: 'Invoice not found' };
  if (invoice.status === 'CANCELLED') return { ok: false, error: 'Already cancelled.' };
  if (invoice.payments.length > 0) {
    return { ok: false, error: 'Delete linked payments before cancelling this invoice.' };
  }

  const wasFinalized = invoice.status !== 'DRAFT';

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({ where: { id }, data: { status: 'CANCELLED' } });
    if (wasFinalized) {
      for (const item of invoice.items) {
        if (item.productId) {
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'IN',
              quantity: item.quantity,
              reason: `Reversal of cancelled invoice ${invoice.number}`,
              refType: 'invoice-cancel',
              refId: invoice.id,
            },
          });
        }
      }
    }
  });

  await logAudit({ action: 'invoice.cancel', entity: 'Invoice', entityId: id, summary: `Cancelled invoice ${invoice.number}` });
  revalidatePath('/app/invoices');
  revalidatePath(`/app/invoices/${id}`);
  revalidatePath('/app/inventory');
  return { ok: true, id };
}

export async function duplicateInvoice(id: string): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const src = await prisma.invoice.findUnique({ where: { id }, include: { items: true } });
  if (!src) return { ok: false, error: 'Invoice not found' };

  const settings = await getCompanySettings();
  const date = new Date();

  const copy = await prisma.$transaction(async (tx) => {
    const number = await nextDocNumber(settings.invoicePrefix, 'invoice', date, tx);
    return tx.invoice.create({
      data: {
        number,
        date,
        customerId: src.customerId,
        billTo: src.billTo ?? {},
        shipTo: src.shipTo ?? undefined,
        status: 'DRAFT',
        isInterState: src.isInterState,
        placeOfSupply: src.placeOfSupply,
        subtotal: src.subtotal,
        discountTotal: src.discountTotal,
        taxableValue: src.taxableValue,
        cgst: src.cgst,
        sgst: src.sgst,
        igst: src.igst,
        grandTotal: src.grandTotal,
        amountInWords: src.amountInWords,
        notes: src.notes,
        terms: src.terms,
        createdById: authz.userId,
        items: {
          create: src.items.map((i) => ({
            productId: i.productId,
            description: i.description,
            hsnCode: i.hsnCode,
            quantity: i.quantity,
            unit: i.unit,
            rate: i.rate,
            discount: i.discount,
            gstRate: i.gstRate,
            taxableValue: i.taxableValue,
            cgst: i.cgst,
            sgst: i.sgst,
            igst: i.igst,
            amount: i.amount,
          })),
        },
      },
    });
  });

  await logAudit({ action: 'invoice.duplicate', entity: 'Invoice', entityId: copy.id, summary: `Duplicated ${src.number} → ${copy.number}` });
  revalidatePath('/app/invoices');
  return { ok: true, id: copy.id };
}

export async function deleteInvoice(id: string): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) return { ok: false, error: 'Invoice not found' };
  if (invoice.status !== 'DRAFT') {
    return { ok: false, error: 'Only draft invoices can be deleted. Cancel finalized invoices instead.' };
  }

  await prisma.invoice.delete({ where: { id } });
  await logAudit({ action: 'invoice.delete', entity: 'Invoice', entityId: id, summary: `Deleted draft invoice ${invoice.number}` });
  revalidatePath('/app/invoices');
  return { ok: true };
}
