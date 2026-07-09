'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  if ((session.user as { role: string }).role !== 'ADMIN') throw new Error('Admin only');
  return session;
}

export async function createLoan(formData: FormData) {
  await requireAdmin();

  const amount = parseFloat(formData.get('amount') as string);
  const source = formData.get('source') as string;
  const description = formData.get('description') as string | null;
  const date = new Date(formData.get('date') as string);
  const notes = formData.get('notes') as string | null;

  await prisma.loan.create({
    data: { amount, source, description: description || null, date, notes: notes || null },
  });

  revalidatePath('/ledger');
  revalidatePath('/ledger/loans');
  revalidatePath('/ledger/settlement');
}

export async function deleteLoan(id: string) {
  await requireAdmin();
  await prisma.loan.delete({ where: { id } });
  revalidatePath('/ledger');
  revalidatePath('/ledger/loans');
  revalidatePath('/ledger/settlement');
}

export async function createRepayment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const loanId = formData.get('loanId') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const date = new Date(formData.get('date') as string);
  const notes = formData.get('notes') as string | null;

  await prisma.loanRepayment.create({
    data: {
      loanId,
      amount,
      date,
      notes: notes || null,
      paidById: session.user.id,
    },
  });

  revalidatePath('/ledger');
  revalidatePath('/ledger/loans');
  revalidatePath('/ledger/settlement');
}

export async function deleteRepayment(id: string) {
  await requireAdmin();
  await prisma.loanRepayment.delete({ where: { id } });
  revalidatePath('/ledger/loans');
  revalidatePath('/ledger/settlement');
}
