'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/erp/Field';
import { FileUpload } from '@/components/erp/FileUpload';
import { toast } from '@/components/ui/sonner';
import { updateSettings, type SettingsInput } from '@/actions/settings';
import type { CompanySettingsData } from '@/lib/settings';

export function SettingsForm({ settings }: { settings: CompanySettingsData }) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = React.useState<string | null>(settings.logoUrl ?? null);
  const [saving, setSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsInput>({
    defaultValues: {
      companyName: settings.companyName,
      address: settings.address ?? '',
      gstin: settings.gstin ?? '',
      pan: settings.pan ?? '',
      stateCode: settings.stateCode ?? '',
      email: settings.email ?? '',
      phone: settings.phone ?? '',
      bankName: settings.bankName ?? '',
      bankAccountName: settings.bankAccountName ?? '',
      bankAccountNo: settings.bankAccountNo ?? '',
      bankIfsc: settings.bankIfsc ?? '',
      invoicePrefix: settings.invoicePrefix,
      quotationPrefix: settings.quotationPrefix,
      defaultTerms: settings.defaultTerms ?? '',
    },
  });

  const onSubmit = async (values: SettingsInput) => {
    setSaving(true);
    const res = await updateSettings({ ...values, logoUrl });
    setSaving(false);
    if (res.ok) {
      toast.success('Settings saved');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company information</CardTitle>
          <CardDescription>Shown on invoices and documents.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" required error={errors.companyName?.message} className="sm:col-span-2">
            <Input {...register('companyName')} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Textarea {...register('address')} rows={2} />
          </Field>
          <Field label="Email">
            <Input type="email" {...register('email')} />
          </Field>
          <Field label="Phone">
            <Input {...register('phone')} />
          </Field>
          <Field label="Logo" className="sm:col-span-2">
            <FileUpload value={logoUrl} onChange={setLogoUrl} folder="talari-erp/branding" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax & GST</CardTitle>
          <CardDescription>Used to compute CGST/SGST vs IGST.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="GSTIN">
            <Input {...register('gstin')} placeholder="36AAZFT3406A1Z5" />
          </Field>
          <Field label="PAN">
            <Input {...register('pan')} />
          </Field>
          <Field label="State code" hint="2-digit GST state code (e.g. 36 = Telangana)">
            <Input {...register('stateCode')} placeholder="36" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank details</CardTitle>
          <CardDescription>Printed on invoices for payment.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Bank name">
            <Input {...register('bankName')} />
          </Field>
          <Field label="Account name">
            <Input {...register('bankAccountName')} />
          </Field>
          <Field label="Account number">
            <Input {...register('bankAccountNo')} />
          </Field>
          <Field label="IFSC">
            <Input {...register('bankIfsc')} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Number prefixes and default terms.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Invoice prefix" required error={errors.invoicePrefix?.message} hint="e.g. TF → TF/26-27/0001">
            <Input {...register('invoicePrefix')} />
          </Field>
          <Field label="Quotation prefix" required error={errors.quotationPrefix?.message}>
            <Input {...register('quotationPrefix')} />
          </Field>
          <Field label="Default terms & conditions" className="sm:col-span-2">
            <Textarea {...register('defaultTerms')} rows={4} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save settings
        </Button>
      </div>
    </form>
  );
}
