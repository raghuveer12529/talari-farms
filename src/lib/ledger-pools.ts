import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { toNum } from '@/lib/serialize';

/**
 * Farm funds are the farm's own earnings sitting in the bank: income received,
 * less whatever has already been spent from it. Loan money is deliberately NOT
 * part of this pool — a loan is a liability tracked separately, not spendable
 * through the ledger.
 */

/** Round to paise so repeated float subtraction cannot drift. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function farmFundsAvailable(totalIncome: number, spentFromFarmIncome: number): number {
  return round2(totalIncome - spentFromFarmIncome);
}

/** True when `amount` would overdraw `available`, tolerating float noise below a paisa. */
export function exceedsPool(amount: number, available: number): boolean {
  return amount > available + 0.005;
}

/** True when removing an income entry would leave less in the pool than has been spent. */
export function incomeDeletionOverdraws(
  totalIncome: number,
  spentFromFarmIncome: number,
  deletedAmount: number,
): boolean {
  return exceedsPool(spentFromFarmIncome, round2(totalIncome - deletedAmount));
}

type Client = Prisma.TransactionClient | typeof prisma;

/**
 * Current farm-funds balance. Read inside the transaction that writes, so two
 * concurrent entries cannot both pass the check.
 */
export async function getFarmFundsTotals(tx: Client): Promise<{ totalIncome: number; spent: number }> {
  const [income, spent] = await Promise.all([
    tx.ledgerEntry.aggregate({ _sum: { amount: true }, where: { type: 'INCOME' } }),
    tx.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: { type: 'EXPENDITURE', source: 'FARM_INCOME' },
    }),
  ]);
  return {
    totalIncome: toNum(income._sum.amount),
    spent: toNum(spent._sum.amount),
  };
}
