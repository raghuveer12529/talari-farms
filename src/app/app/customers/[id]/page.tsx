import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Globe, FileText, Plus } from 'lucide-react';
import { PageHeader } from '@/components/erp/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmButton } from '@/components/erp/ConfirmButton';
import { InvoiceStatusBadge } from '@/components/erp/InvoiceStatusBadge';
import { prisma } from '@/lib/prisma';
import { deleteCustomer } from '@/actions/customers';
import { formatINR, formatDate } from '@/lib/format';
import { toNum } from '@/lib/serialize';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      invoices: { orderBy: { date: 'desc' } },
      payments: { orderBy: { date: 'desc' }, take: 10 },
    },
  });
  if (!customer) notFound();

  const billed = customer.invoices
    .filter((i) => i.status !== 'CANCELLED')
    .reduce((s, i) => s + toNum(i.grandTotal), 0);
  const paid = customer.payments.reduce((s, p) => s + toNum(p.amount), 0);
  const outstanding = Math.max(0, Math.round((billed - paid) * 100) / 100);

  return (
    <div className="space-y-6">
      <Link
        href="/app/customers"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to customers
      </Link>

      <PageHeader title={customer.companyName} description={customer.industry ?? undefined}>
        <Button asChild variant="outline">
          <Link href={`/app/customers/${id}/edit`}>
            <Pencil className="size-4" /> Edit
          </Link>
        </Button>
        <ConfirmButton
          variant="outline"
          action={deleteCustomer.bind(null, id)}
          confirmTitle="Delete customer?"
          confirmMessage="This permanently removes the customer and their payment records."
          successMessage="Customer deleted"
          redirectTo="/app/customers"
        >
          <Trash2 className="size-4" /> Delete
        </ConfirmButton>
      </PageHeader>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">Total billed</div>
            <div className="mt-1 font-display text-xl font-bold">{formatINR(billed)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">Total received</div>
            <div className="mt-1 font-display text-xl font-bold">{formatINR(paid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">Outstanding</div>
            <div className="mt-1 font-display text-xl font-bold text-amber-600 dark:text-amber-400">
              {formatINR(outstanding)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {customer.contactPerson && (
              <Detail label="Contact">{customer.contactPerson}</Detail>
            )}
            {customer.email && (
              <Detail label="Email" icon={<Mail className="size-3.5" />}>{customer.email}</Detail>
            )}
            {customer.phone && (
              <Detail label="Phone" icon={<Phone className="size-3.5" />}>{customer.phone}</Detail>
            )}
            {customer.website && (
              <Detail label="Website" icon={<Globe className="size-3.5" />}>{customer.website}</Detail>
            )}
            {customer.gstin && <Detail label="GSTIN">{customer.gstin}</Detail>}
            {customer.pan && <Detail label="PAN">{customer.pan}</Detail>}
            {customer.billingAddress && (
              <Detail label="Billing address">
                <span className="whitespace-pre-line">{customer.billingAddress}</span>
              </Detail>
            )}
            {customer.shippingAddress && (
              <Detail label="Shipping address">
                <span className="whitespace-pre-line">{customer.shippingAddress}</span>
              </Detail>
            )}
            {customer.notes && (
              <Detail label="Notes">
                <span className="whitespace-pre-line">{customer.notes}</span>
              </Detail>
            )}
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Invoices</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href={`/app/invoices/new?customerId=${id}`}>
                <Plus className="size-4" /> New invoice
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {customer.invoices.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                <FileText className="size-6 opacity-50" />
                No invoices yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {customer.invoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/app/invoices/${inv.id}`}
                    className="flex items-center justify-between py-3 transition-colors hover:bg-muted/40"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{inv.number}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(inv.date)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <InvoiceStatusBadge status={inv.status} />
                      <span className="font-semibold tabular-nums">{formatINR(toNum(inv.grandTotal))}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {customer.payments.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent payments
                </h4>
                <div className="divide-y divide-border">
                  {customer.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                      <div>
                        <span className="font-medium text-foreground">{p.receiptNo}</span>
                        <Badge variant="muted" className="ml-2">{p.mode.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{formatDate(p.date)}</span>
                        <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                          {formatINR(toNum(p.amount))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-foreground">{children}</div>
    </div>
  );
}
