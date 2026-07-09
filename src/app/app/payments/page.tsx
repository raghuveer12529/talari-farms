import Link from 'next/link';
import { Plus, Wallet } from 'lucide-react';
import type { Prisma } from '@prisma/client';
import { PageHeader } from '@/components/erp/PageHeader';
import { EmptyState } from '@/components/erp/EmptyState';
import { SearchBox } from '@/components/erp/SearchBox';
import { Pagination } from '@/components/erp/Pagination';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { toNum } from '@/lib/serialize';
import { formatINR } from '@/lib/format';
import { PaymentsTable, type PaymentRow } from './PaymentsTable';

export const metadata = { title: 'Payments | Talari Farms ERP' };

const PAGE_SIZE = 10;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.PaymentWhereInput = q
    ? {
        OR: [
          { receiptNo: { contains: q, mode: 'insensitive' } },
          { customer: { companyName: { contains: q, mode: 'insensitive' } } },
          { invoice: { number: { contains: q, mode: 'insensitive' } } },
        ],
      }
    : {};

  const [payments, total, sum] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { customer: { select: { companyName: true } }, invoice: { select: { number: true } } },
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({ _sum: { amount: true }, where }),
  ]);

  const rows: PaymentRow[] = payments.map((p) => ({
    id: p.id,
    receiptNo: p.receiptNo,
    customerName: p.customer.companyName,
    invoiceNumber: p.invoice?.number ?? null,
    amount: toNum(p.amount),
    date: p.date.toISOString(),
    mode: p.mode,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description={`${total} payment${total === 1 ? '' : 's'} received`}>
        <Button asChild>
          <Link href="/app/payments/new">
            <Plus className="size-4" /> Record payment
          </Link>
        </Button>
      </PageHeader>

      {total === 0 && !q ? (
        <EmptyState
          icon={Wallet}
          title="No payments yet"
          description="Record a payment against an invoice or on account."
          action={
            <Button asChild>
              <Link href="/app/payments/new">Record payment</Link>
            </Button>
          }
        />
      ) : (
        <>
          <SearchBox placeholder="Search payments…" />
          <PaymentsTable rows={rows} />
          <Pagination basePath="/app/payments" currentPage={page} totalPages={totalPages} params={{ q }} total={total} pageSize={PAGE_SIZE} />
          <p className="text-right text-sm text-muted-foreground">
            Total received{q ? ' (filtered)' : ''}:{' '}
            <span className="font-semibold text-foreground">{formatINR(toNum(sum._sum.amount))}</span>
          </p>
        </>
      )}
    </div>
  );
}
