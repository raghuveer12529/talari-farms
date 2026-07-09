'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { assertCan, type Role } from '@/lib/permissions';
import { nextDocNumber } from '@/lib/invoice-number';
import { logAudit } from '@/lib/audit';
import { toNum } from '@/lib/serialize';
import type { Prisma } from '@prisma/client';

const paymentSchema = z.object({
  invoiceId: z.string().optional().nullable(),
  customerId: z.string().min(1, 'Select a customer'),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().min(1),
  mode: z.enum(['UPI', 'BANK_TRANSFER', 'CASH', 'CHEQUE']),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

type Result = { ok: true; id?: string } | { ok: false; error: string };

async function authorize() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: 'Unauthorized' };
  try {
    assertCan(session.user.role as Role, 'payments');
    return { ok: true as const, userId: session.user.id };
  } catch {
    return { ok: false as const, error: 'You do not have permission to record payments.' };
  }
}

/** Recompute an invoice's status from its payments (within a transaction). */
async function syncInvoiceStatus(tx: Prisma.TransactionClient, invoiceId: string) {
  const invoice = await tx.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });
  if (!invoice || invoice.status === 'CANCELLED' || invoice.status === 'DRAFT') return;

  const paid = invoice.payments.reduce((s, p) => s + toNum(p.amount), 0);
  let status: 'SENT' | 'PARTIAL' | 'PAID' = 'SENT';
  if (paid >= toNum(invoice.grandTotal) - 0.01) status = 'PAID';
  else if (paid > 0) status = 'PARTIAL';

  if (status !== invoice.status) {
    await tx.invoice.update({ where: { id: invoiceId }, data: { status } });
  }
}

export async function recordPayment(input: PaymentInput): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' };
  const d = parsed.data;

  let customerId = d.customerId;
  if (d.invoiceId) {
    const invoice = await prisma.invoice.findUnique({ where: { id: d.invoiceId } });
    if (!invoice) return { ok: false, error: 'Invoice not found' };
    if (invoice.status === 'DRAFT') return { ok: false, error: 'Finalize the invoice before recording a payment.' };
    if (invoice.status === 'CANCELLED') return { ok: false, error: 'Cannot pay a cancelled invoice.' };
    customerId = invoice.customerId;
  }

  const date = new Date(d.date);

  const payment = await prisma.$transaction(async (tx) => {
    const receiptNo = await nextDocNumber('RCPT', 'receipt', date, tx);
    const p = await tx.payment.create({
      data: {
        receiptNo,
        invoiceId: d.invoiceId || null,
        customerId,
        amount: d.amount,
        date,
        mode: d.mode,
        reference: d.reference || null,
        notes: d.notes || null,
        createdById: authz.userId,
      },
    });
    if (d.invoiceId) await syncInvoiceStatus(tx, d.invoiceId);
    return p;
  });

  await logAudit({ action: 'payment.record', entity: 'Payment', entityId: payment.id, summary: `Recorded payment ${payment.receiptNo} of ₹${d.amount}` });
  revalidatePath('/app/payments');
  revalidatePath('/app/invoices');
  if (d.invoiceId) revalidatePath(`/app/invoices/${d.invoiceId}`);
  revalidatePath(`/app/customers/${customerId}`);
  revalidatePath('/app');
  return { ok: true, id: payment.id };
}

export async function deletePayment(id: string): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) return { ok: false, error: 'Payment not found' };

  await prisma.$transaction(async (tx) => {
    await tx.payment.delete({ where: { id } });
    if (payment.invoiceId) await syncInvoiceStatus(tx, payment.invoiceId);
  });

  await logAudit({ action: 'payment.delete', entity: 'Payment', entityId: id, summary: `Deleted payment ${payment.receiptNo}` });
  revalidatePath('/app/payments');
  revalidatePath('/app/invoices');
  if (payment.invoiceId) revalidatePath(`/app/invoices/${payment.invoiceId}`);
  revalidatePath(`/app/customers/${payment.customerId}`);
  revalidatePath('/app');
  return { ok: true };
}
