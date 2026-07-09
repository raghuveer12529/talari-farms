'use client';

import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Package } from 'lucide-react';
import { DataTable } from '@/components/erp/DataTable';
import { EmptyState } from '@/components/erp/EmptyState';
import { Badge } from '@/components/ui/badge';
import { formatINR, formatNumber } from '@/lib/format';

export interface ProductRow {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  price: number;
  gstRate: number;
  stock: number;
  lowStock: boolean;
  active: boolean;
}

export function ProductsTable({ rows }: { rows: ProductRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<ProductRow>[] = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.sku}</div>
        </div>
      ),
    },
    { accessorKey: 'category', header: 'Category' },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => <span className="tabular-nums">{formatINR(row.original.price)}</span>,
    },
    {
      accessorKey: 'gstRate',
      header: 'GST',
      cell: ({ row }) => <span className="tabular-nums">{row.original.gstRate}%</span>,
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="tabular-nums">
            {formatNumber(row.original.stock)} {row.original.unit}
          </span>
          {row.original.lowStock && <Badge variant="warning">Low</Badge>}
          {!row.original.active && <Badge variant="muted">Inactive</Badge>}
        </div>
      ),
    },
  ];

  if (rows.length === 0) {
    return <EmptyState icon={Package} title="No matching products" description="Try a different search." />;
  }

  return (
    <DataTable columns={columns} data={rows} pageSize={50} onRowClick={(r) => router.push(`/app/products/${r.id}`)} />
  );
}
