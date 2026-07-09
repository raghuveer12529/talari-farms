'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Trash2, Wallet } from 'lucide-react';
import { DataTable } from '@/components/erp/DataTable';
import { EmptyState } from '@/components/erp/EmptyState';
import { Badge } from '@/components/ui/badge';
import { ConfirmButton } from '@/components/erp/ConfirmButton';
import { deletePayment } from '@/actions/payments';
import { formatINR, formatDate } from '@/lib/format';

export interface PaymentRow {
  id: string;
  receiptNo: string;
  customerName: string;
  invoiceNumber: string | null;
  amount: number;
  date: string;
  mode: string;
}

export function PaymentsTable({ rows }: { rows: PaymentRow[] }) {
  const columns: ColumnDef<PaymentRow>[] = [
    {
      accessorKey: 'receiptNo',
      header: 'Receipt #',
      cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.receiptNo}</span>,
    },
    { accessorKey: 'customerName', header: 'Customer' },
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.invoiceNumber ?? 'On account'}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.date)}</span>,
    },
    {
      accessorKey: 'mode',
      header: 'Mode',
      cell: ({ row }) => <Badge variant="muted">{row.original.mode.replace('_', ' ')}</Badge>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatINR(row.original.amount)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <ConfirmButton
          variant="ghost"
          size="icon"
          action={deletePayment.bind(null, row.original.id)}
          confirmTitle="Delete payment?"
          confirmMessage="This removes the payment and updates the linked invoice status."
          successMessage="Payment deleted"
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 className="size-4" />
        </ConfirmButton>
      ),
    },
  ];

  if (rows.length === 0) {
    return <EmptyState icon={Wallet} title="No matching payments" description="Try a different search." />;
  }

  return <DataTable columns={columns} data={rows} pageSize={50} />;
}
