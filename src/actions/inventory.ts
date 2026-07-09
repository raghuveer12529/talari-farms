'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { assertCan, type Role } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

const adjustSchema = z.object({
  productId: z.string().min(1),
  direction: z.enum(['IN', 'OUT', 'ADJUST']),
  quantity: z.coerce.number().refine((n) => n !== 0, 'Quantity cannot be zero'),
  reason: z.string().min(1, 'Reason is required'),
});

export type AdjustInput = z.infer<typeof adjustSchema>;

type Result = { ok: true } | { ok: false; error: string };

export async function adjustStock(input: AdjustInput): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'Unauthorized' };
  try {
    assertCan(session.user.role as Role, 'inventory');
  } catch {
    return { ok: false, error: 'You do not have permission to adjust inventory.' };
  }

  const parsed = adjustSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' };
  const { productId, direction, quantity, reason } = parsed.data;

  // ADJUST stores a signed delta; IN/OUT store positive magnitudes.
  const qty = direction === 'ADJUST' ? quantity : Math.abs(quantity);

  await prisma.stockMovement.create({
    data: { productId, type: direction, quantity: qty, reason },
  });

  await logAudit({ action: 'stock.adjust', entity: 'Product', entityId: productId, summary: `Stock ${direction} ${qty} — ${reason}` });
  revalidatePath('/app/inventory');
  revalidatePath(`/app/products/${productId}`);
  revalidatePath('/app');
  return { ok: true };
}
