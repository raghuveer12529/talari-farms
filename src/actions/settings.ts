'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { assertCan, type Role } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

const settingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  address: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  pan: z.string().optional().nullable(),
  stateCode: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankAccountName: z.string().optional().nullable(),
  bankAccountNo: z.string().optional().nullable(),
  bankIfsc: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  invoicePrefix: z.string().min(1, 'Invoice prefix is required'),
  quotationPrefix: z.string().min(1, 'Quotation prefix is required'),
  defaultTerms: z.string().optional().nullable(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export async function updateSettings(input: SettingsInput) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: 'Unauthorized' };
  try {
    assertCan(session.user.role as Role, 'settings');
  } catch {
    return { ok: false as const, error: 'You do not have permission to edit settings.' };
  }

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid data' };
  }

  const data = parsed.data;
  await prisma.companySettings.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  });

  await logAudit({ action: 'settings.update', entity: 'CompanySettings', entityId: 'default', summary: 'Updated company settings' });
  revalidatePath('/app/settings');
  revalidatePath('/app');
  return { ok: true as const };
}
