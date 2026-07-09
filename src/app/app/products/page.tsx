import Link from 'next/link';
import { Plus, Package } from 'lucide-react';
import type { Prisma } from '@prisma/client';
import { PageHeader } from '@/components/erp/PageHeader';
import { EmptyState } from '@/components/erp/EmptyState';
import { SearchBox } from '@/components/erp/SearchBox';
import { Pagination } from '@/components/erp/Pagination';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { getStockMap } from '@/lib/stock';
import { toNum } from '@/lib/serialize';
import { ProductsTable, type ProductRow } from './ProductsTable';

export const metadata = { title: 'Products | Talari Farms ERP' };

const PAGE_SIZE = 10;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.ProductWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};

  const [products, total, stockMap] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { name: 'asc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.product.count({ where }),
    getStockMap(),
  ]);

  const rows: ProductRow[] = products.map((p) => {
    const stock = stockMap[p.id]?.current ?? 0;
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      unit: p.unit,
      price: toNum(p.price),
      gstRate: p.gstRate,
      stock,
      lowStock: p.lowStockThreshold > 0 && stock <= p.lowStockThreshold,
      active: p.active,
    };
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description={`${total} product${total === 1 ? '' : 's'}`}>
        <Button asChild>
          <Link href="/app/products/new">
            <Plus className="size-4" /> New product
          </Link>
        </Button>
      </PageHeader>

      {total === 0 && !q ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your Gac Fruit products to start selling."
          action={
            <Button asChild>
              <Link href="/app/products/new">Add product</Link>
            </Button>
          }
        />
      ) : (
        <>
          <SearchBox placeholder="Search products…" />
          <ProductsTable rows={rows} />
          <Pagination basePath="/app/products" currentPage={page} totalPages={totalPages} params={{ q }} total={total} pageSize={PAGE_SIZE} />
        </>
      )}
    </div>
  );
}
