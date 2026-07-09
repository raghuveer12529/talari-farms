import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/erp/PageHeader';
import { CustomerForm } from '@/components/erp/CustomerForm';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Edit customer | Talari Farms ERP' };

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/app/customers/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to customer
      </Link>
      <PageHeader title="Edit customer" description={customer.companyName} />
      <CustomerForm customer={customer} />
    </div>
  );
}
