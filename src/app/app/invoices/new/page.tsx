import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/erp/PageHeader';
import { EmptyState } from '@/components/erp/EmptyState';
import { Button } from '@/components/ui/button';
import { InvoiceForm, type CustomerOption } from '@/components/erp/InvoiceForm';
import { prisma } from '@/lib/prisma';
import { getCompanySettings } from '@/lib/settings';
import { toNum } from '@/lib/serialize';
import { Users } from 'lucide-react';

export const metadata = { title: 'New invoice | Talari Farms ERP' };

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;
  const [customers, products, settings] = await Promise.all([
    prisma.customer.findMany({ orderBy: { companyName: 'asc' }, select: { id: true, companyName: true, gstin: true } }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, sku: true, hsnCode: true, unit: true, price: true, gstRate: true },
    }),
    getCompanySettings(),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/app/invoices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to invoices
      </Link>
      <PageHeader title="New invoice" description="Create a GST invoice." />
      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Add a customer first"
          description="You need at least one customer to create an invoice."
          action={
            <Button asChild>
              <Link href="/app/customers/new">Add customer</Link>
            </Button>
          }
        />
      ) : (
        <InvoiceForm
          customers={customers as CustomerOption[]}
          products={products.map((p) => ({ ...p, price: toNum(p.price) }))}
          sellerStateCode={settings.stateCode}
          defaultTerms={settings.defaultTerms}
          preselectCustomerId={customerId}
        />
      )}
    </div>
  );
}
