import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/erp/PageHeader';
import { CustomerForm } from '@/components/erp/CustomerForm';

export const metadata = { title: 'New customer | Talari Farms ERP' };

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/app/customers"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to customers
      </Link>
      <PageHeader title="New customer" description="Add a customer to your CRM." />
      <CustomerForm />
    </div>
  );
}
