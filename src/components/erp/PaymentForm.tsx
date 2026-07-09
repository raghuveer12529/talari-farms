'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/erp/Field';
import { toast } from '@/components/ui/sonner';
import { recordPayment, type PaymentInput } from '@/actions/payments';
import { formatINR } from '@/lib/format';

export interface PayableInvoice {
  id: string;
  number: string;
  customerId: string;
  balance: number;
}

interface Props {
  customers: { id: string; companyName: string }[];
  invoices: PayableInvoice[];
  preselect?: { invoiceId?: string; customerId?: string; amount?: number };
}

export function PaymentForm({ customers, invoices, preselect }: Props) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PaymentInput>({
    defaultValues: {
      invoiceId: preselect?.invoiceId ?? '',
      customerId: preselect?.customerId ?? '',
      amount: preselect?.amount ?? 0,
      date: new Date().toISOString().slice(0, 10),
      mode: 'BANK_TRANSFER',
      reference: '',
      notes: '',
    },
  });

  const selectedCustomer = watch('customerId');
  const selectedInvoice = watch('invoiceId');

  const customerInvoices = invoices.filter((i) => !selectedCustomer || i.customerId === selectedCustomer);

  // When an invoice is chosen, sync customer + suggest its balance.
  React.useEffect(() => {
    if (!selectedInvoice) return;
    const inv = invoices.find((i) => i.id === selectedInvoice);
    if (inv) {
      setValue('customerId', inv.customerId);
      const amt = watch('amount');
      if (!amt || amt === 0) setValue('amount', inv.balance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInvoice]);

  const onSubmit = async (values: PaymentInput) => {
    setSaving(true);
    const res = await recordPayment(values);
    setSaving(false);
    if (res.ok) {
      toast.success('Payment recorded');
      router.push('/app/payments');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer" required error={errors.customerId?.message}>
            <Select {...register('customerId')}>
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </Select>
          </Field>
          <Field label="Against invoice" hint="Optional — leave blank for an on-account payment">
            <Select {...register('invoiceId')}>
              <option value="">No specific invoice</option>
              {customerInvoices.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.number} — bal {formatINR(i.balance)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Amount (₹)" required error={errors.amount?.message}>
            <Input type="number" step="0.01" {...register('amount')} />
          </Field>
          <Field label="Date" required>
            <Input type="date" {...register('date')} />
          </Field>
          <Field label="Mode" required>
            <Select {...register('mode')}>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
            </Select>
          </Field>
          <Field label="Reference / Txn ID">
            <Input {...register('reference')} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea {...register('notes')} rows={2} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Record payment
        </Button>
      </div>
    </form>
  );
}
