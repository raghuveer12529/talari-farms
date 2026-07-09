import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/erp/PageHeader';
import { InvoiceForm, type CustomerOption } from '@/components/erp/InvoiceForm';
import { prisma } from '@/lib/prisma';
import { getCompanySettings } from '@/lib/settings';
import { toDateInput } from '@/lib/format';
import { toNum } from '@/lib/serialize';

export const metadata = { title: 'Edit invoice | Talari Farms ERP' };

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { items: true } });
  if (!invoice) notFound();
  if (invoice.status !== 'DRAFT') redirect(`/app/invoices/${id}`);

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
      <Link href={`/app/invoices/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to invoice
      </Link>
      <PageHeader title={`Edit ${invoice.number}`} description="Draft invoice" />
      <InvoiceForm
        customers={customers as CustomerOption[]}
        products={products.map((p) => ({ ...p, price: toNum(p.price) }))}
        sellerStateCode={settings.stateCode}
        defaultTerms={settings.defaultTerms}
        invoice={{
          id: invoice.id,
          customerId: invoice.customerId,
          date: toDateInput(invoice.date),
          dueDate: invoice.dueDate ? toDateInput(invoice.dueDate) : '',
          isInterState: invoice.isInterState,
          placeOfSupply: invoice.placeOfSupply,
          notes: invoice.notes,
          terms: invoice.terms,
          items: invoice.items.map((i) => ({
            productId: i.productId ?? '',
            description: i.description,
            hsnCode: i.hsnCode ?? '',
            quantity: i.quantity,
            unit: i.unit,
            rate: toNum(i.rate),
            discount: i.discount,
            gstRate: i.gstRate,
          })),
        }}
      />
    </div>
  );
}
