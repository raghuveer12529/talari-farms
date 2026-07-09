import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, Pencil, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/erp/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InvoiceStatusBadge } from '@/components/erp/InvoiceStatusBadge';
import { InvoiceActions } from '@/components/erp/InvoiceActions';
import { prisma } from '@/lib/prisma';
import { formatINR, formatDate, formatNumber } from '@/lib/format';
import { toNum } from '@/lib/serialize';

interface Party {
  companyName?: string;
  address?: string;
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      customer: { select: { id: true, companyName: true } },
      payments: { orderBy: { date: 'desc' } },
    },
  });
  if (!invoice) notFound();

  const billTo = (invoice.billTo ?? {}) as Party;
  const shipTo = (invoice.shipTo ?? {}) as Party;
  const grandTotal = toNum(invoice.grandTotal);
  const paid = invoice.payments.reduce((s, p) => s + toNum(p.amount), 0);
  const balance = invoice.status === 'CANCELLED' ? 0 : Math.max(0, Math.round((grandTotal - paid) * 100) / 100);

  return (
    <div className="space-y-6">
      <Link href="/app/invoices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to invoices
      </Link>

      <PageHeader title={invoice.number} description={`Issued ${formatDate(invoice.date)}`}>
        <InvoiceStatusBadge status={invoice.status} />
        <Button asChild variant="outline">
          <a href={`/api/invoices/${id}/pdf`} target="_blank" rel="noopener noreferrer">
            <Download className="size-4" /> PDF
          </a>
        </Button>
        {invoice.status === 'DRAFT' && (
          <Button asChild variant="outline">
            <Link href={`/app/invoices/${id}/edit`}>
              <Pencil className="size-4" /> Edit
            </Link>
          </Button>
        )}
        {invoice.status !== 'CANCELLED' && balance > 0 && (
          <Button asChild>
            <Link href={`/app/payments/new?invoiceId=${id}`}>
              <Wallet className="size-4" /> Record payment
            </Link>
          </Button>
        )}
        <InvoiceActions id={id} status={invoice.status} />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Grand total</div><div className="mt-1 font-display text-xl font-bold">{formatINR(grandTotal)}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Received</div><div className="mt-1 font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatINR(paid)}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Balance due</div><div className="mt-1 font-display text-xl font-bold text-amber-600 dark:text-amber-400">{formatINR(balance)}</div></CardContent></Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Bill to</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="font-semibold text-foreground">{billTo.companyName}</div>
            {billTo.address && <div className="whitespace-pre-line text-muted-foreground">{billTo.address}</div>}
            {billTo.gstin && <div className="text-muted-foreground">GSTIN: {billTo.gstin}</div>}
            {billTo.phone && <div className="text-muted-foreground">{billTo.phone}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ship to</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="font-semibold text-foreground">{shipTo.companyName}</div>
            {shipTo.address && <div className="whitespace-pre-line text-muted-foreground">{shipTo.address}</div>}
            {invoice.placeOfSupply && <div className="text-muted-foreground">Place of supply: {invoice.placeOfSupply}</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>#</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>HSN</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Disc%</TableHead>
                <TableHead className="text-right">GST%</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, i) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">{item.description}</TableCell>
                  <TableCell className="text-muted-foreground">{item.hsnCode ?? '—'}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(item.quantity)} {item.unit}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(toNum(item.rate))}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.discount}%</TableCell>
                  <TableCell className="text-right tabular-nums">{item.gstRate}%</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{formatINR(toNum(item.amount))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col items-end gap-1 border-t border-border px-6 py-4 text-sm">
            <SummaryRow label="Subtotal" value={formatINR(toNum(invoice.subtotal))} />
            {toNum(invoice.discountTotal) > 0 && <SummaryRow label="Discount" value={`− ${formatINR(toNum(invoice.discountTotal))}`} />}
            <SummaryRow label="Taxable value" value={formatINR(toNum(invoice.taxableValue))} />
            {invoice.isInterState ? (
              <SummaryRow label="IGST" value={formatINR(toNum(invoice.igst))} />
            ) : (
              <>
                <SummaryRow label="CGST" value={formatINR(toNum(invoice.cgst))} />
                <SummaryRow label="SGST" value={formatINR(toNum(invoice.sgst))} />
              </>
            )}
            <div className="mt-1 flex w-full max-w-xs items-center justify-between border-t border-border pt-2 text-base font-bold">
              <span>Grand total</span>
              <span className="tabular-nums">{formatINR(grandTotal)}</span>
            </div>
            <p className="w-full max-w-md pt-1 text-right text-xs italic text-muted-foreground">
              {invoice.amountInWords}
            </p>
          </div>
        </CardContent>
      </Card>

      {(invoice.notes || invoice.terms) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {invoice.notes && (
            <Card><CardHeader><CardTitle>Notes</CardTitle></CardHeader><CardContent className="whitespace-pre-line text-sm text-muted-foreground">{invoice.notes}</CardContent></Card>
          )}
          {invoice.terms && (
            <Card><CardHeader><CardTitle>Terms</CardTitle></CardHeader><CardContent className="whitespace-pre-line text-sm text-muted-foreground">{invoice.terms}</CardContent></Card>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full max-w-xs items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}
