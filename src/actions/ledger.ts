'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { ledgerEntrySchema } from '@/lib/ledger-schemas';
import { assertLedgerWriter, canDeleteEntry, type LedgerResult, firstError } from '@/lib/ledger-auth';
import {
  getFarmFundsTotals,
  farmFundsAvailable,
  exceedsPool,
  incomeDeletionOverdraws,
} from '@/lib/ledger-pools';
import { toNum } from '@/lib/serialize';

function formatRupees(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);
}

function revalidateLedger() {
  revalidatePath('/ledger');
  revalidatePath('/ledger/entries');
  revalidatePath('/ledger/settlement');
}

export async function createLedgerEntry(formData: FormData): Promise<LedgerResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Unauthorized' };
  if (!assertLedgerWriter(session.user.role)) {
    return { ok: false, error: 'You do not have permission to add ledger entries.' };
  }

  const parsed = ledgerEntrySchema.safeParse({
    type: formData.get('type'),
    amount: formData.get('amount'),
    category: formData.get('category'),
    date: formData.get('date'),
    source: formData.get('source') || null,
    notes: formData.get('notes'),
    paidById: formData.get('paidById'),
  });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;

  // Spending from farm funds cannot overdraw what the farm has earned. The pool
  // is read inside the transaction that writes, so two concurrent entries
  // cannot both pass the check.
  const me = session.user.id;

  const created = await prisma.$transaction(async (tx) => {
    // Recording on another partner's behalf: the entry is credited to them,
    // not to whoever is typing. Verify they are actually a ledger partner so a
    // crafted request cannot attribute money to an arbitrary user.
    let partnerId = me;
    if (d.paidById && d.paidById !== me) {
      const payer = await tx.user.findUnique({ where: { id: d.paidById } });
      if (!payer || !assertLedgerWriter(payer.role)) {
        return { ok: false as const, error: 'That partner was not found.' };
      }
      partnerId = payer.id;
    }

    if (d.source === 'FARM_INCOME') {
      const { totalIncome, spent } = await getFarmFundsTotals(tx);
      const available = farmFundsAvailable(totalIncome, spent);
      if (exceedsPool(d.amount, available)) {
        return {
          ok: false as const,
          error: `Only ${formatRupees(available)} available in farm funds.`,
        };
      }
    }

    const entry = await tx.ledgerEntry.create({
      data: {
        type: d.type,
        amount: d.amount,
        category: d.category,
        date: d.date,
        source: d.source,
        notes: d.notes,
        partnerId,
        recordedById: me,
      },
      include: { partner: true },
    });
    return { ok: true as const, entry };
  });

  if (!created.ok) return created;
  const entry = created.entry;

  await logAudit({
    action: 'ledger.entry.create',
    entity: 'LedgerEntry',
    entityId: entry.id,
    summary:
      entry.partnerId === me
        ? `${d.type === 'INCOME' ? 'Income' : 'Expenditure'} ₹${d.amount} — ${d.category}`
        : `Expenditure ₹${d.amount} — ${d.category}, recorded on behalf of ${entry.partner.name}`,
  });
  revalidateLedger();
  return { ok: true };
}

export async function deleteLedgerEntry(id: string): Promise<LedgerResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const entry = await prisma.ledgerEntry.findUnique({ where: { id } });
  if (!entry) throw new Error('Entry not found');

  if (!canDeleteEntry({ id: session.user.id, role: session.user.role }, entry)) {
    return { ok: false, error: 'You can only delete entries you paid for or recorded.' };
  }

  // Removing income that has already been spent from would leave the farm-funds
  // pool overdrawn, so refuse rather than let it go negative.
  if (entry.type === 'INCOME') {
    const { totalIncome, spent } = await getFarmFundsTotals(prisma);
    if (incomeDeletionOverdraws(totalIncome, spent, toNum(entry.amount))) {
      return {
        ok: false,
        error:
          'Cannot delete this income — farm funds have already been spent against it. Remove those expenditures first.',
      };
    }
  }

  await prisma.ledgerEntry.delete({ where: { id } });

  await logAudit({
    action: 'ledger.entry.delete',
    entity: 'LedgerEntry',
    entityId: id,
    summary: `Deleted ${entry.type === 'INCOME' ? 'income' : 'expenditure'} ₹${entry.amount.toFixed(2)} — ${entry.category}`,
  });
  revalidateLedger();
  return { ok: true };
}
