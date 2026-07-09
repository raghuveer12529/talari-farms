import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import type { Prisma } from '@prisma/client';
import { PageHeader } from '@/components/erp/PageHeader';
import { EmptyState } from '@/components/erp/EmptyState';
import { SearchBox } from '@/components/erp/SearchBox';
import { Pagination } from '@/components/erp/Pagination';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { toNum } from '@/lib/serialize';
import { InvoicesTable, type InvoiceRow } from './InvoicesTable';

export const metadata = { title: 'Invoices | Talari Farms ERP' };

const PAGE_SIZE = 10;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.InvoiceWhereInput = q
    ? {
        OR: [
          { number: { contains: q, mode: 'insensitive' } },
          { customer: { companyName: { contains: q, mode: 'insensitive' } } },
        ],
      }
    : {};

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { customer: { select: { companyName: true } }, payments: { select: { amount: true } } },
    }),
    prisma.invoice.count({ where }),
  ]);

  const rows: InvoiceRow[] = invoices.map((inv) => {
    const grandTotal = toNum(inv.grandTotal);
    const paid = inv.payments.reduce((s, p) => s + toNum(p.amount), 0);
    const balance = inv.status === 'CANCELLED' ? 0 : Math.max(0, Math.round((grandTotal - paid) * 100) / 100);
    return {
      id: inv.id,
      number: inv.number,
      customerName: inv.customer.companyName,
      date: inv.date.toISOString(),
      status: inv.status,
      grandTotal,
      balance,
    };
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description={`${total} invoice${total === 1 ? '' : 's'}`}>
        <Button asChild>
          <Link href="/app/invoices/new">
            <Plus className="size-4" /> New invoice
          </Link>
        </Button>
      </PageHeader>

      {total === 0 && !q ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Create your first GST invoice to start billing customers."
          action={
            <Button asChild>
              <Link href="/app/invoices/new">New invoice</Link>
            </Button>
          }
        />
      ) : (
        <>
          <SearchBox placeholder="Search invoices…" />
          <InvoicesTable rows={rows} />
          <Pagination basePath="/app/invoices" currentPage={page} totalPages={totalPages} params={{ q }} total={total} pageSize={PAGE_SIZE} />
        </>
      )}
    </div>
  );
}
