import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/erp/PageHeader';
import { PaymentForm, type PayableInvoice } from '@/components/erp/PaymentForm';
import { prisma } from '@/lib/prisma';
import { toNum } from '@/lib/serialize';

export const metadata = { title: 'Record payment | Talari Farms ERP' };

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ invoiceId?: string }>;
}) {
  const { invoiceId } = await searchParams;

  const [customers, openInvoices] = await Promise.all([
    prisma.customer.findMany({ orderBy: { companyName: 'asc' }, select: { id: true, companyName: true } }),
    prisma.invoice.findMany({
      where: { status: { in: ['SENT', 'PARTIAL'] } },
      orderBy: { date: 'desc' },
      include: { payments: { select: { amount: true } } },
    }),
  ]);

  const payable: PayableInvoice[] = openInvoices
    .map((inv) => {
      const paid = inv.payments.reduce((s, p) => s + toNum(p.amount), 0);
      return {
        id: inv.id,
        number: inv.number,
        customerId: inv.customerId,
        balance: Math.max(0, Math.round((toNum(inv.grandTotal) - paid) * 100) / 100),
      };
    })
    .filter((i) => i.balance > 0);

  const preselectInvoice = invoiceId ? payable.find((i) => i.id === invoiceId) : undefined;

  return (
    <div className="space-y-6">
      <Link href="/app/payments" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to payments
      </Link>
      <PageHeader title="Record payment" description="Log a customer payment." />
      <PaymentForm
        customers={customers}
        invoices={payable}
        preselect={
          preselectInvoice
            ? { invoiceId: preselectInvoice.id, customerId: preselectInvoice.customerId, amount: preselectInvoice.balance }
            : undefined
        }
      />
    </div>
  );
}
