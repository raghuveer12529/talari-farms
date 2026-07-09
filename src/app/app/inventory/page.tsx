import { Boxes } from 'lucide-react';
import { PageHeader } from '@/components/erp/PageHeader';
import { EmptyState } from '@/components/erp/EmptyState';
import { prisma } from '@/lib/prisma';
import { getStockMap } from '@/lib/stock';
import { InventoryView, type InventoryRow, type MovementRow } from './InventoryView';

export const metadata = { title: 'Inventory | Talari Farms ERP' };

export default async function InventoryPage() {
  const [products, stockMap, movements] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    getStockMap(),
    prisma.stockMovement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { product: { select: { name: true, unit: true } } },
    }),
  ]);

  const rows: InventoryRow[] = products.map((p) => {
    const s = stockMap[p.id];
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      unit: p.unit,
      current: s?.current ?? 0,
      available: s?.available ?? 0,
      reserved: s?.reserved ?? 0,
      lowStockThreshold: p.lowStockThreshold,
    };
  });

  const movementRows: MovementRow[] = movements.map((m) => ({
    id: m.id,
    productName: m.product.name,
    type: m.type,
    quantity: m.quantity,
    unit: m.product.unit,
    reason: m.reason,
    createdAt: m.createdAt,
  }));

  const lowCount = rows.filter((r) => r.lowStockThreshold > 0 && r.current <= r.lowStockThreshold).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description={lowCount > 0 ? `${lowCount} product(s) low on stock` : 'Stock levels and movement history'}
      />
      {rows.length === 0 ? (
        <EmptyState icon={Boxes} title="No products to track" description="Add products to manage inventory." />
      ) : (
        <InventoryView rows={rows} movements={movementRows} />
      )}
    </div>
  );
}
