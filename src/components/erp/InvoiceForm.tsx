'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/erp/Field';
import { toast } from '@/components/ui/sonner';
import { createInvoice, updateInvoice, type InvoiceInput } from '@/actions/invoices';
import { computeInvoice, isInterStateSupply } from '@/lib/gst';
import { amountInWords } from '@/lib/amount-in-words';
import { formatINR, toDateInput } from '@/lib/format';

export interface CustomerOption {
  id: string;
  companyName: string;
  gstin: string | null;
}
export interface ProductOption {
  id: string;
  name: string;
  sku: string;
  hsnCode: string;
  unit: string;
  price: number;
  gstRate: number;
}

interface Props {
  customers: CustomerOption[];
  products: ProductOption[];
  sellerStateCode: string | null;
  defaultTerms: string | null;
  preselectCustomerId?: string;
  invoice?: {
    id: string;
    customerId: string;
    date: string;
    dueDate: string | null;
    isInterState: boolean;
    placeOfSupply: string | null;
    notes: string | null;
    terms: string | null;
    items: InvoiceInput['items'];
  };
}

const blankItem = (): InvoiceInput['items'][number] => ({
  productId: '',
  description: '',
  hsnCode: '',
  quantity: 1,
  unit: 'kg',
  rate: 0,
  discount: 0,
  gstRate: 0,
});

export function InvoiceForm({
  customers,
  products,
  sellerStateCode,
  defaultTerms,
  preselectCustomerId,
  invoice,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const isEdit = Boolean(invoice);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } =
    useForm<InvoiceInput>({
      defaultValues: invoice
        ? {
            customerId: invoice.customerId,
            date: invoice.date,
            dueDate: invoice.dueDate ?? '',
            isInterState: invoice.isInterState,
            placeOfSupply: invoice.placeOfSupply ?? '',
            notes: invoice.notes ?? '',
            terms: invoice.terms ?? '',
            items: invoice.items,
          }
        : {
            customerId: preselectCustomerId ?? '',
            date: toDateInput(new Date()),
            dueDate: '',
            isInterState: false,
            placeOfSupply: '',
            notes: '',
            terms: defaultTerms ?? '',
            items: [blankItem()],
          },
    });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const watchedItems = watch('items');
  const watchedInterState = watch('isInterState');
  const watchedCustomer = watch('customerId');

  // Auto-detect inter-state when customer changes (user can still override).
  React.useEffect(() => {
    const c = customers.find((x) => x.id === watchedCustomer);
    if (c) {
      setValue('isInterState', isInterStateSupply(sellerStateCode, c.gstin));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCustomer]);

  const { totals } = computeInvoice(
    (watchedItems ?? []).map((i) => ({
      quantity: Number(i.quantity) || 0,
      rate: Number(i.rate) || 0,
      discount: Number(i.discount) || 0,
      gstRate: Number(i.gstRate) || 0,
    })),
    watchedInterState,
  );

  const onProductPick = (index: number, productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setValue(`items.${index}.description`, p.name);
    setValue(`items.${index}.hsnCode`, p.hsnCode);
    setValue(`items.${index}.unit`, p.unit);
    setValue(`items.${index}.rate`, p.price);
    setValue(`items.${index}.gstRate`, p.gstRate);
  };

  const onSubmit = async (values: InvoiceInput) => {
    setSaving(true);
    const res = isEdit ? await updateInvoice(invoice!.id, values) : await createInvoice(values);
    setSaving(false);
    if (res.ok) {
      toast.success(isEdit ? 'Invoice updated' : 'Invoice created');
      router.push(`/app/invoices/${res.id ?? invoice!.id}`);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Customer" required error={errors.customerId?.message} className="sm:col-span-2">
            <Select {...register('customerId')}>
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </Select>
          </Field>
          <Field label="Invoice date" required>
            <Input type="date" {...register('date')} />
          </Field>
          <Field label="Due date">
            <Input type="date" {...register('dueDate')} />
          </Field>
          <Field label="Place of supply">
            <Input {...register('placeOfSupply')} placeholder="Telangana" />
          </Field>
          <Field label="Tax type">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-input bg-background px-3 text-sm">
              <input type="checkbox" {...register('isInterState')} className="size-4 accent-[hsl(var(--primary))]" />
              Inter-state (IGST)
            </label>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Line items</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={() => append(blankItem())}>
            <Plus className="size-4" /> Add line
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.items?.message && <p className="text-xs text-red-500">{errors.items.message}</p>}
          {fields.map((field, index) => {
            const item = watchedItems?.[index];
            const lineAmount =
              computeInvoice(
                [
                  {
                    quantity: Number(item?.quantity) || 0,
                    rate: Number(item?.rate) || 0,
                    discount: Number(item?.discount) || 0,
                    gstRate: Number(item?.gstRate) || 0,
                  },
                ],
                watchedInterState,
              ).totals.grandTotal;

            return (
              <div key={field.id} className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="grid gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-4">
                    <Field label="Product / Description" error={errors.items?.[index]?.description?.message}>
                      <Controller
                        control={control}
                        name={`items.${index}.productId`}
                        render={({ field: pf }) => (
                          <Select
                            value={pf.value ?? ''}
                            onChange={(e) => {
                              pf.onChange(e.target.value);
                              if (e.target.value) onProductPick(index, e.target.value);
                            }}
                          >
                            <option value="">Custom item…</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </Select>
                        )}
                      />
                      <Input className="mt-2" placeholder="Description" {...register(`items.${index}.description`)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="HSN">
                      <Input {...register(`items.${index}.hsnCode`)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                    <Field label="Qty">
                      <Input type="number" step="0.01" {...register(`items.${index}.quantity`)} />
                    </Field>
                    <Field label="Unit">
                      <Input {...register(`items.${index}.unit`)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                    <Field label="Rate">
                      <Input type="number" step="0.01" {...register(`items.${index}.rate`)} />
                    </Field>
                    <Field label="Disc%">
                      <Input type="number" step="0.01" {...register(`items.${index}.discount`)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                    <Field label="GST%">
                      <Input type="number" step="0.01" {...register(`items.${index}.gstRate`)} />
                    </Field>
                    <div className="flex flex-col">
                      <span className="mb-1.5 text-sm font-medium text-foreground/80">Amount</span>
                      <div className="flex h-10 items-center justify-end rounded-xl bg-background px-2 text-sm font-semibold tabular-nums">
                        {formatINR(lineAmount)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fields.length > 1 && remove(index)}
                    disabled={fields.length === 1}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="size-4" /> Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notes & terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Notes">
              <Textarea {...register('notes')} rows={2} />
            </Field>
            <Field label="Terms & conditions">
              <Textarea {...register('terms')} rows={3} />
            </Field>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <SummaryRow label="Subtotal" value={formatINR(totals.subtotal)} />
            {totals.discountTotal > 0 && (
              <SummaryRow label="Discount" value={`− ${formatINR(totals.discountTotal)}`} />
            )}
            <SummaryRow label="Taxable value" value={formatINR(totals.taxableValue)} />
            {watchedInterState ? (
              <SummaryRow label="IGST" value={formatINR(totals.igst)} />
            ) : (
              <>
                <SummaryRow label="CGST" value={formatINR(totals.cgst)} />
                <SummaryRow label="SGST" value={formatINR(totals.sgst)} />
              </>
            )}
            <div className="my-2 border-t border-border" />
            <div className="flex items-center justify-between text-base font-bold">
              <span>Grand total</span>
              <span className="tabular-nums">{formatINR(totals.grandTotal)}</span>
            </div>
            <p className="pt-1 text-xs italic text-muted-foreground">{amountInWords(totals.grandTotal)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isEdit ? 'Save changes' : 'Save invoice'}
        </Button>
      </div>
    </form>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}
