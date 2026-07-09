import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import type { Prisma } from '@prisma/client';
import { PageHeader } from '@/components/erp/PageHeader';
import { EmptyState } from '@/components/erp/EmptyState';
import { SearchBox } from '@/components/erp/SearchBox';
import { Pagination } from '@/components/erp/Pagination';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { toNum } from '@/lib/serialize';
import { CustomersTable, type CustomerRow } from './CustomersTable';

export const metadata = { title: 'Customers | Talari Farms ERP' };

const PAGE_SIZE = 10;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.CustomerWhereInput = q
    ? {
        OR: [
          { companyName: { contains: q, mode: 'insensitive' } },
          { contactPerson: { contains: q, mode: 'insensitive' } },
          { gstin: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { companyName: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        invoices: { where: { status: { not: 'CANCELLED' } }, select: { grandTotal: true } },
        payments: { select: { amount: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  const rows: CustomerRow[] = customers.map((c) => {
    const billed = c.invoices.reduce((s, i) => s + toNum(i.grandTotal), 0);
    const paid = c.payments.reduce((s, p) => s + toNum(p.amount), 0);
    return {
      id: c.id,
      companyName: c.companyName,
      contactPerson: c.contactPerson,
      gstin: c.gstin,
      phone: c.phone,
      invoiceCount: c.invoices.length,
      outstanding: Math.max(0, Math.round((billed - paid) * 100) / 100),
    };
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description={`${total} customer${total === 1 ? '' : 's'}`}>
        <Button asChild>
          <Link href="/app/customers/new">
            <Plus className="size-4" /> New customer
          </Link>
        </Button>
      </PageHeader>

      {total === 0 && !q ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Add your first customer to start creating quotations and invoices."
          action={
            <Button asChild>
              <Link href="/app/customers/new">Add customer</Link>
            </Button>
          }
        />
      ) : (
        <>
          <SearchBox placeholder="Search customers…" />
          <CustomersTable rows={rows} />
          <Pagination basePath="/app/customers" currentPage={page} totalPages={totalPages} params={{ q }} total={total} pageSize={PAGE_SIZE} />
        </>
      )}
    </div>
  );
}
