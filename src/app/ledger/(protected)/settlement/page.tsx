import { prisma } from '@/lib/prisma';
import SettlementClient from './SettlementClient';
import { toPlainAmount } from '@/lib/serialize';

export default async function SettlementPage() {
  const [entryRows, loanRows, partners] = await Promise.all([
    prisma.ledgerEntry.findMany({ include: { partner: true }, orderBy: { date: 'desc' } }),
    prisma.loan.findMany({ include: { repayments: { include: { paidBy: true } } } }),
    prisma.user.findMany({ select: { id: true, name: true, role: true }, orderBy: { createdAt: 'asc' } }),
  ]);

  // Decimal is not serializable across the RSC boundary — hand the client
  // component plain numbers.
  const entries = entryRows.map(toPlainAmount);
  const loans = loanRows.map((l) => ({ ...toPlainAmount(l), repayments: l.repayments.map(toPlainAmount) }));

  return <SettlementClient entries={entries} loans={loans} partners={partners} />;
}
