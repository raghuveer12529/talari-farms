import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, FileText } from 'lucide-react';
import { PageHeader } from '@/components/erp/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmButton } from '@/components/erp/ConfirmButton';
import { BatchManager } from '@/components/erp/BatchManager';
import { prisma } from '@/lib/prisma';
import { deleteProduct } from '@/actions/products';
import { getStockLevel } from '@/lib/stock';
import { formatINR, formatNumber } from '@/lib/format';
import { toNum } from '@/lib/serialize';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { batches: { orderBy: { createdAt: 'desc' } } },
  });
  if (!product) notFound();

  const stock = await getStockLevel(id);
  const lowStock = product.lowStockThreshold > 0 && stock.current <= product.lowStockThreshold;

  return (
    <div className="space-y-6">
      <Link href="/app/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to products
      </Link>

      <PageHeader title={product.name} description={`${product.sku} · ${product.category}`}>
        <Button asChild variant="outline">
          <Link href={`/app/products/${id}/edit`}>
            <Pencil className="size-4" /> Edit
          </Link>
        </Button>
        <ConfirmButton
          variant="outline"
          action={deleteProduct.bind(null, id)}
          confirmTitle="Delete product?"
          confirmMessage="This permanently removes the product. Products used on invoices cannot be deleted."
          successMessage="Product deleted"
          redirectTo="/app/products"
        >
          <Trash2 className="size-4" /> Delete
        </ConfirmButton>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="On hand" value={`${formatNumber(stock.current)} ${product.unit}`} alert={lowStock} />
        <Stat label="Available" value={`${formatNumber(stock.available)} ${product.unit}`} />
        <Stat label="Reserved" value={`${formatNumber(Math.max(0, stock.reserved))} ${product.unit}`} />
        <Stat label="Selling price" value={formatINR(toNum(product.price))} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="HSN code" value={product.hsnCode} />
            <Row label="GST" value={`${product.gstRate}%`} />
            <Row label="Cost price" value={formatINR(toNum(product.costPrice))} />
            <Row label="Unit" value={product.unit} />
            <Row label="Country of origin" value={product.countryOfOrigin ?? '—'} />
            <Row label="Storage" value={product.storageConditions ?? '—'} />
            <Row label="Status" value={product.active ? 'Active' : 'Inactive'} />
            {product.description && (
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</div>
                <p className="mt-0.5 whitespace-pre-line text-foreground">{product.description}</p>
              </div>
            )}
            {product.coaUrl && (
              <a href={product.coaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                <FileText size={15} /> View COA
              </a>
            )}
            {product.images.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {product.images.map((url) => (
                  <div key={url} className="relative size-16 overflow-hidden rounded-lg border border-border">
                    <Image src={url} alt={product.name} fill className="object-cover" sizes="64px" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <BatchManager
              productId={product.id}
              unit={product.unit}
              batches={product.batches}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          {alert && <Badge variant="warning">Low</Badge>}
        </div>
        <div className="mt-1 font-display text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
