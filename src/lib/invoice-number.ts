import { prisma } from '@/lib/prisma';
import { fyLabel } from '@/lib/fy';

/**
 * Atomically generate the next document number for a financial year, e.g.
 * `TF/26-27/0001`. Uses a per-(docType, FY) Counter row updated inside a
 * transaction so concurrent requests never collide.
 *
 * Pass an existing transaction client when generating inside a larger
 * transaction (e.g. creating an invoice).
 */
export async function nextDocNumber(
  prefix: string,
  docType: 'invoice' | 'quotation' | 'receipt',
  date: Date = new Date(),
  tx: Pick<typeof prisma, 'counter'> = prisma,
): Promise<string> {
  const fy = fyLabel(date);
  const counterId = `${docType}-${fy}`;

  const counter = await tx.counter.upsert({
    where: { id: counterId },
    create: { id: counterId, value: 1 },
    update: { value: { increment: 1 } },
  });

  const seq = String(counter.value).padStart(4, '0');
  return `${prefix}/${fy}/${seq}`;
}
