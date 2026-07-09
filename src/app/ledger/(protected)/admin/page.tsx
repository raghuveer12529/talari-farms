import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const session = await auth();
  const role = (session!.user as { role: string }).role;
  if (role !== 'ADMIN') redirect('/ledger');

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  return <AdminClient users={users} currentUserId={session!.user.id} />;
}
