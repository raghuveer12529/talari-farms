'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { toNum } from '@/lib/serialize';
import { loanSchema, repaymentSchema } from '@/lib/ledger-schemas';
import { assertLedgerWriter, type LedgerResult, firstError } from '@/lib/ledger-auth';

function revalidateLoans() {
  revalidatePath('/ledger');
  revalidatePath('/ledger/loans');
  revalidatePath('/ledger/settlement');
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  if (session.user.role !== 'ADMIN') throw new Error('Admin only');
  return session;
}

export async function createLoan(formData: FormData): Promise<LedgerResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Unauthorized' };
  if (session.user.role !== 'ADMIN') {
    return { ok: false, error: 'Only an admin can record a loan.' };
  }

  const parsed = loanSchema.safeParse({
    amount: formData.get('amount'),
    source: formData.get('source'),
    description: formData.get('description'),
    date: formData.get('date'),
    notes: formData.get('notes'),
  });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;

  const loan = await prisma.loan.create({ data: d });

  await logAudit({
    action: 'ledger.loan.create',
    entity: 'Loan',
    entityId: loan.id,
    summary: `Recorded loan of ₹${d.amount} from ${d.source}`,
  });
  revalidateLoans();
  return { ok: true };
}

export async function deleteLoan(id: string) {
  await requireAdmin();
  const loan = await prisma.loan.findUnique({ where: { id }, include: { repayments: true } });
  if (!loan) throw new Error('Loan not found');

  await prisma.loan.delete({ where: { id } });

  await logAudit({
    action: 'ledger.loan.delete',
    entity: 'Loan',
    entityId: id,
    summary: `Deleted loan of ₹${toNum(loan.amount).toFixed(2)} from ${loan.source} (and ${loan.repayments.length} repayment(s))`,
  });
  revalidateLoans();
}

export async function createRepayment(formData: FormData): Promise<LedgerResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Unauthorized' };
  if (!assertLedgerWriter(session.user.role)) {
    return { ok: false, error: 'You do not have permission to record repayments.' };
  }

  const parsed = repaymentSchema.safeParse({
    loanId: formData.get('loanId'),
    amount: formData.get('amount'),
    date: formData.get('date'),
    notes: formData.get('notes'),
  });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;

  // Read the loan and its repayments inside the transaction that writes, so two
  // concurrent repayments cannot both pass the outstanding-balance check.
  const result = await prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({ where: { id: d.loanId }, include: { repayments: true } });
    if (!loan) return { ok: false as const, error: 'Loan not found' };

    const repaid = loan.repayments.reduce((s, r) => s + toNum(r.amount), 0);
    const outstanding = toNum(loan.amount) - repaid;
    if (d.amount > outstanding + 0.005) {
      return {
        ok: false as const,
        error: `Repayment exceeds the outstanding balance of ₹${outstanding.toFixed(2)}.`,
      };
    }

    const repayment = await tx.loanRepayment.create({
      data: { ...d, paidById: session.user!.id! },
    });
    return { ok: true as const, id: repayment.id, source: loan.source };
  });

  if (!result.ok) return result;

  await logAudit({
    action: 'ledger.repayment.create',
    entity: 'LoanRepayment',
    entityId: result.id,
    summary: `Repaid ₹${d.amount} against loan from ${result.source}`,
  });
  revalidateLoans();
  return { ok: true };
}

export async function deleteRepayment(id: string) {
  await requireAdmin();
  const repayment = await prisma.loanRepayment.findUnique({ where: { id } });
  if (!repayment) throw new Error('Repayment not found');

  await prisma.loanRepayment.delete({ where: { id } });

  await logAudit({
    action: 'ledger.repayment.delete',
    entity: 'LoanRepayment',
    entityId: id,
    summary: `Deleted repayment of ₹${toNum(repayment.amount).toFixed(2)}`,
  });
  revalidateLoans();
}
