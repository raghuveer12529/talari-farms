import { prisma } from '@/lib/prisma';

export interface StockLevel {
  inQty: number;
  outQty: number;
  adjustQty: number;
  reserved: number;
  /** physical on-hand = IN - OUT + ADJUST */
  current: number;
  /** available to sell = current - reserved */
  available: number;
}

const EMPTY: StockLevel = {
  inQty: 0,
  outQty: 0,
  adjustQty: 0,
  reserved: 0,
  current: 0,
  available: 0,
};

function levelFromGroups(
  groups: { type: string; _sum: { quantity: number | null } }[],
): StockLevel {
  const get = (t: string) => groups.find((g) => g.type === t)?._sum.quantity ?? 0;
  const inQty = get('IN');
  const outQty = get('OUT');
  const adjustQty = get('ADJUST'); // signed
  const reserved = get('RESERVE') - get('RELEASE');
  const current = Math.round((inQty - outQty + adjustQty) * 1000) / 1000;
  return {
    inQty,
    outQty,
    adjustQty,
    reserved,
    current,
    available: Math.round((current - Math.max(0, reserved)) * 1000) / 1000,
  };
}

/** Stock level for a single product. */
export async function getStockLevel(productId: string): Promise<StockLevel> {
  const groups = await prisma.stockMovement.groupBy({
    by: ['type'],
    where: { productId },
    _sum: { quantity: true },
  });
  return levelFromGroups(groups);
}

/** Stock levels for all products, keyed by product id. */
export async function getStockMap(): Promise<Record<string, StockLevel>> {
  const groups = await prisma.stockMovement.groupBy({
    by: ['productId', 'type'],
    _sum: { quantity: true },
  });

  const byProduct: Record<string, { type: string; _sum: { quantity: number | null } }[]> = {};
  for (const g of groups) {
    (byProduct[g.productId] ??= []).push({ type: g.type, _sum: g._sum });
  }

  const map: Record<string, StockLevel> = {};
  for (const [pid, gs] of Object.entries(byProduct)) {
    map[pid] = levelFromGroups(gs);
  }
  return map;
}

export { EMPTY as EMPTY_STOCK };
