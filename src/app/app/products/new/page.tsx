import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/erp/PageHeader';
import { ProductForm } from '@/components/erp/ProductForm';

export const metadata = { title: 'New product | Talari Farms ERP' };

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/app/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to products
      </Link>
      <PageHeader title="New product" description="Add a product to your catalogue." />
      <ProductForm />
    </div>
  );
}
