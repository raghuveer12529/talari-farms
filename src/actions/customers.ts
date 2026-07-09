'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { assertCan, type Role } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

const customerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactPerson: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  pan: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  billingAddress: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CustomerInput = z.infer<typeof customerSchema>;

type Result = { ok: true; id?: string } | { ok: false; error: string };

async function authorize(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Unauthorized' };
  try {
    assertCan(session.user.role as Role, 'customers');
    return { ok: true };
  } catch {
    return { ok: false, error: 'You do not have permission to manage customers.' };
  }
}

function clean(input: CustomerInput) {
  // Convert empty strings to null for optional fields.
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    out[k] = v === '' ? null : v;
  }
  return out as CustomerInput;
}

export async function createCustomer(input: CustomerInput): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' };

  const customer = await prisma.customer.create({ data: clean(parsed.data) });
  await logAudit({ action: 'customer.create', entity: 'Customer', entityId: customer.id, summary: `Created customer ${customer.companyName}` });
  revalidatePath('/app/customers');
  return { ok: true, id: customer.id };
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' };

  await prisma.customer.update({ where: { id }, data: clean(parsed.data) });
  await logAudit({ action: 'customer.update', entity: 'Customer', entityId: id, summary: `Updated customer ${parsed.data.companyName}` });
  revalidatePath('/app/customers');
  revalidatePath(`/app/customers/${id}`);
  return { ok: true, id };
}

export async function deleteCustomer(id: string): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const invoiceCount = await prisma.invoice.count({ where: { customerId: id } });
  if (invoiceCount > 0) {
    return { ok: false, error: 'Cannot delete a customer with invoices. Cancel them first.' };
  }

  const existing = await prisma.customer.findUnique({ where: { id } });
  await prisma.payment.deleteMany({ where: { customerId: id } });
  await prisma.customer.delete({ where: { id } });
  await logAudit({ action: 'customer.delete', entity: 'Customer', entityId: id, summary: `Deleted customer ${existing?.companyName ?? id}` });
  revalidatePath('/app/customers');
  return { ok: true };
}
