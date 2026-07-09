'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function createLedgerEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const type = formData.get('type') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const category = formData.get('category') as string;
  const date = new Date(formData.get('date') as string);
  const source = type === 'EXPENDITURE' ? (formData.get('source') as string) : null;
  const notes = formData.get('notes') as string | null;

  if (category === 'OTHER' && !notes?.trim()) {
    throw new Error('Notes are required when category is OTHER');
  }

  await prisma.ledgerEntry.create({
    data: {
      type: type as 'INCOME' | 'EXPENDITURE',
      amount,
      category,
      date,
      source: source as 'OWN_POCKET' | 'LOAN_FUNDS' | null,
      notes: notes || null,
      partnerId: session.user.id,
    },
  });

  revalidatePath('/ledger');
  revalidatePath('/ledger/entries');
  revalidatePath('/ledger/settlement');
}

export async function deleteLedgerEntry(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const entry = await prisma.ledgerEntry.findUnique({ where: { id } });
  if (!entry) throw new Error('Entry not found');

  const isAdmin = (session.user as { role: string }).role === 'ADMIN';
  if (!isAdmin && entry.partnerId !== session.user.id) {
    throw new Error('Forbidden');
  }

  await prisma.ledgerEntry.delete({ where: { id } });

  revalidatePath('/ledger');
  revalidatePath('/ledger/entries');
  revalidatePath('/ledger/settlement');
}
