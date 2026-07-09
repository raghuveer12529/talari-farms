import { prisma } from '@/lib/prisma';
import SettlementClient from './SettlementClient';

export default async function SettlementPage() {
  const [entries, loans, partners] = await Promise.all([
    prisma.ledgerEntry.findMany({ include: { partner: true }, orderBy: { date: 'desc' } }),
    prisma.loan.findMany({ include: { repayments: { include: { paidBy: true } } } }),
    prisma.user.findMany({ select: { id: true, name: true, role: true }, orderBy: { createdAt: 'asc' } }),
  ]);

  return <SettlementClient entries={entries} loans={loans} partners={partners} />;
}
