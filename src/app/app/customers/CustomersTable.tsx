'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Users } from 'lucide-react';
import { DataTable } from '@/components/erp/DataTable';
import { EmptyState } from '@/components/erp/EmptyState';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/format';

export interface CustomerRow {
  id: string;
  companyName: string;
  contactPerson: string | null;
  gstin: string | null;
  phone: string | null;
  outstanding: number;
  invoiceCount: number;
}

export function CustomersTable({ rows }: { rows: CustomerRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<CustomerRow>[] = [
    {
      accessorKey: 'companyName',
      header: 'Company',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground">{row.original.companyName}</div>
          {row.original.contactPerson && (
            <div className="text-xs text-muted-foreground">{row.original.contactPerson}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'gstin',
      header: 'GSTIN',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.gstin || '—'}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.phone || '—'}</span>
      ),
    },
    {
      accessorKey: 'invoiceCount',
      header: 'Invoices',
      cell: ({ row }) => <span className="tabular-nums">{row.original.invoiceCount}</span>,
    },
    {
      accessorKey: 'outstanding',
      header: 'Outstanding',
      cell: ({ row }) => {
        const v = row.original.outstanding;
        return v > 0 ? (
          <Badge variant="warning" className="tabular-nums">
            {formatINR(v)}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      },
    },
  ];

  if (rows.length === 0) {
    return <EmptyState icon={Users} title="No matching customers" description="Try a different search." />;
  }

  return (
    <DataTable columns={columns} data={rows} pageSize={50} onRowClick={(r) => router.push(`/app/customers/${r.id}`)} />
  );
}
