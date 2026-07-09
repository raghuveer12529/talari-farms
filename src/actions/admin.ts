'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  if ((session.user as { role: string }).role !== 'ADMIN') throw new Error('Admin only');
  return session;
}

export async function createPartner(formData: FormData) {
  await requireAdmin();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = (formData.get('role') as string) || 'PARTNER';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('A user with this email already exists');

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, passwordHash, role: role as 'ADMIN' | 'PARTNER' },
  });

  revalidatePath('/ledger/admin');
}

export async function deletePartner(id: string) {
  await requireAdmin();

  const session = await auth();
  if (session!.user.id === id) throw new Error('Cannot delete yourself');

  await prisma.user.delete({ where: { id } });
  revalidatePath('/ledger/admin');
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const userId = formData.get('userId') as string;
  const newPassword = formData.get('newPassword') as string;

  const isAdmin = (session.user as { role: string }).role === 'ADMIN';
  if (!isAdmin && session.user.id !== userId) throw new Error('Forbidden');

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath('/ledger/admin');
}
