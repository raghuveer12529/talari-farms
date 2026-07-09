'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { assertCan, type Role } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  hsnCode: z.string().min(1, 'HSN code is required'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  description: z.string().optional().nullable(),
  gstRate: z.coerce.number().min(0).max(100),
  price: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0),
  lowStockThreshold: z.coerce.number().min(0),
  storageConditions: z.string().optional().nullable(),
  countryOfOrigin: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  coaUrl: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

type Result = { ok: true; id?: string } | { ok: false; error: string };

async function authorize() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: 'Unauthorized' };
  try {
    assertCan(session.user.role as Role, 'products');
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: 'You do not have permission to manage products.' };
  }
}

export async function createProduct(input: ProductInput): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' };

  const exists = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
  if (exists) return { ok: false, error: 'A product with this SKU already exists.' };

  const product = await prisma.product.create({
    data: { ...parsed.data, images: parsed.data.images ?? [] },
  });
  await logAudit({ action: 'product.create', entity: 'Product', entityId: product.id, summary: `Created product ${product.name} (${product.sku})` });
  revalidatePath('/app/products');
  return { ok: true, id: product.id };
}

export async function updateProduct(id: string, input: ProductInput): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' };

  const dup = await prisma.product.findFirst({
    where: { sku: parsed.data.sku, NOT: { id } },
  });
  if (dup) return { ok: false, error: 'Another product already uses this SKU.' };

  await prisma.product.update({
    where: { id },
    data: { ...parsed.data, images: parsed.data.images ?? [] },
  });
  await logAudit({ action: 'product.update', entity: 'Product', entityId: id, summary: `Updated product ${parsed.data.name}` });
  revalidatePath('/app/products');
  revalidatePath(`/app/products/${id}`);
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const used = await prisma.invoiceItem.count({ where: { productId: id } });
  if (used > 0) {
    return { ok: false, error: 'Cannot delete a product used on invoices. Mark it inactive instead.' };
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  await prisma.product.delete({ where: { id } });
  await logAudit({ action: 'product.delete', entity: 'Product', entityId: id, summary: `Deleted product ${existing?.name ?? id}` });
  revalidatePath('/app/products');
  return { ok: true };
}

// ── Batches ──────────────────────────────────────────────────
const batchSchema = z.object({
  productId: z.string().min(1),
  batchNumber: z.string().min(1, 'Batch number is required'),
  quantity: z.coerce.number().min(0),
  manufacturingDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  coaUrl: z.string().optional().nullable(),
});

export type BatchInput = z.infer<typeof batchSchema>;

export async function createBatch(input: BatchInput): Promise<Result> {
  const authz = await authorize();
  if (!authz.ok) return authz;

  const parsed = batchSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' };
  const d = parsed.data;

  await prisma.$transaction(async (tx) => {
    const batch = await tx.batch.create({
      data: {
        productId: d.productId,
        batchNumber: d.batchNumber,
        quantity: d.quantity,
        manufacturingDate: d.manufacturingDate ? new Date(d.manufacturingDate) : null,
        expiryDate: d.expiryDate ? new Date(d.expiryDate) : null,
        coaUrl: d.coaUrl || null,
      },
    });
    // Adding a batch adds physical stock.
    if (d.quantity > 0) {
      await tx.stockMovement.create({
        data: {
          productId: d.productId,
          batchId: batch.id,
          type: 'IN',
          quantity: d.quantity,
          reason: `Batch ${d.batchNumber} added`,
          refType: 'batch',
          refId: batch.id,
        },
      });
    }
  });

  await logAudit({ action: 'batch.create', entity: 'Batch', entityId: d.productId, summary: `Added batch ${d.batchNumber} (qty ${d.quantity})` });
  revalidatePath(`/app/products/${d.productId}`);
  revalidatePath('/app/inventory');
  return { ok: true };
}
