'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/erp/Field';
import { toast } from '@/components/ui/sonner';
import { createCustomer, updateCustomer, type CustomerInput } from '@/actions/customers';

interface Props {
  customer?: CustomerInput & { id: string };
}

export function CustomerForm({ customer }: Props) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const isEdit = Boolean(customer);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInput>({
    defaultValues: {
      companyName: customer?.companyName ?? '',
      contactPerson: customer?.contactPerson ?? '',
      gstin: customer?.gstin ?? '',
      pan: customer?.pan ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      billingAddress: customer?.billingAddress ?? '',
      shippingAddress: customer?.shippingAddress ?? '',
      industry: customer?.industry ?? '',
      website: customer?.website ?? '',
      notes: customer?.notes ?? '',
    },
  });

  const onSubmit = async (values: CustomerInput) => {
    setSaving(true);
    const res = isEdit
      ? await updateCustomer(customer!.id, values)
      : await createCustomer(values);
    setSaving(false);
    if (res.ok) {
      toast.success(isEdit ? 'Customer updated' : 'Customer created');
      router.push(`/app/customers/${res.id ?? customer!.id}`);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" required error={errors.companyName?.message} className="sm:col-span-2">
            <Input {...register('companyName')} />
          </Field>
          <Field label="Contact person">
            <Input {...register('contactPerson')} />
          </Field>
          <Field label="Industry">
            <Input {...register('industry')} placeholder="Nutraceutical, Cosmetic…" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register('email')} />
          </Field>
          <Field label="Phone">
            <Input {...register('phone')} />
          </Field>
          <Field label="Website">
            <Input {...register('website')} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="GSTIN" hint="Used to determine inter/intra-state GST">
            <Input {...register('gstin')} />
          </Field>
          <Field label="PAN">
            <Input {...register('pan')} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Addresses & notes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Billing address">
            <Textarea {...register('billingAddress')} rows={3} />
          </Field>
          <Field label="Shipping address">
            <Textarea {...register('shippingAddress')} rows={3} />
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
          {isEdit ? 'Save changes' : 'Create customer'}
        </Button>
      </div>
    </form>
  );
}
