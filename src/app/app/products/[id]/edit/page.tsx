import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/erp/PageHeader';
import { ProductForm } from '@/components/erp/ProductForm';
import { prisma } from '@/lib/prisma';
import { toNum } from '@/lib/serialize';

export const metadata = { title: 'Edit product | Talari Farms ERP' };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/app/products/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to product
      </Link>
      <PageHeader title="Edit product" description={product.name} />
      <ProductForm product={{ ...product, price: toNum(product.price), costPrice: toNum(product.costPrice) }} />
    </div>
  );
}
