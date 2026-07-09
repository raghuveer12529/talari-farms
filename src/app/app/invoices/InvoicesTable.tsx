'use client';

import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import { DataTable } from '@/components/erp/DataTable';
import { EmptyState } from '@/components/erp/EmptyState';
import { InvoiceStatusBadge } from '@/components/erp/InvoiceStatusBadge';
import { formatINR, formatDate } from '@/lib/format';

export interface InvoiceRow {
  id: string;
  number: string;
  customerName: string;
  date: string;
  status: 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'CANCELLED';
  grandTotal: number;
  balance: number;
}

export function InvoicesTable({ rows }: { rows: InvoiceRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<InvoiceRow>[] = [
    {
      accessorKey: 'number',
      header: 'Invoice #',
      cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.number}</span>,
    },
    { accessorKey: 'customerName', header: 'Customer' },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.date)}</span>,
    },
    {
      accessorKey: 'grandTotal',
      header: 'Total',
      cell: ({ row }) => <span className="tabular-nums">{formatINR(row.original.grandTotal)}</span>,
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) =>
        row.original.balance > 0 ? (
          <span className="tabular-nums text-amber-600 dark:text-amber-400">
            {formatINR(row.original.balance)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
    },
  ];

  if (rows.length === 0) {
    return <EmptyState icon={FileText} title="No matching invoices" description="Try a different search." />;
  }

  return (
    <DataTable columns={columns} data={rows} pageSize={50} onRowClick={(r) => router.push(`/app/invoices/${r.id}`)} />
  );
}
