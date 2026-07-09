'use client';

import * as React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Loader2, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/erp/Field';
import { FileUpload } from '@/components/erp/FileUpload';
import { toast } from '@/components/ui/sonner';
import { createProduct, updateProduct, type ProductInput } from '@/actions/products';

interface Props {
  product?: ProductInput & { id: string };
}

const UNITS = ['kg', 'g', 'L', 'ml', 'piece', 'box', 'packet'];
const GST_RATES = [0, 5, 12, 18, 28];

export function ProductForm({ product }: Props) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [images, setImages] = React.useState<string[]>(product?.images ?? []);
  const [coaUrl, setCoaUrl] = React.useState<string | null>(product?.coaUrl ?? null);
  const isEdit = Boolean(product);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductInput>({
    defaultValues: {
      sku: product?.sku ?? '',
      name: product?.name ?? '',
      hsnCode: product?.hsnCode ?? '',
      category: product?.category ?? '',
      unit: product?.unit ?? 'kg',
      description: product?.description ?? '',
      gstRate: product?.gstRate ?? 0,
      price: product?.price ?? 0,
      costPrice: product?.costPrice ?? 0,
      lowStockThreshold: product?.lowStockThreshold ?? 0,
      storageConditions: product?.storageConditions ?? '',
      countryOfOrigin: product?.countryOfOrigin ?? 'India',
    },
  });

  const onSubmit = async (values: ProductInput) => {
    setSaving(true);
    const payload = { ...values, images, coaUrl };
    const res = isEdit
      ? await updateProduct(product!.id, payload)
      : await createProduct(payload);
    setSaving(false);
    if (res.ok) {
      toast.success(isEdit ? 'Product updated' : 'Product created');
      router.push(`/app/products/${res.id ?? product!.id}`);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name" required error={errors.name?.message} className="sm:col-span-2">
            <Input {...register('name')} />
          </Field>
          <Field label="SKU" required error={errors.sku?.message}>
            <Input {...register('sku')} placeholder="TF-GAC-FRESH" />
          </Field>
          <Field label="HSN code" required error={errors.hsnCode?.message}>
            <Input {...register('hsnCode')} />
          </Field>
          <Field label="Category" required error={errors.category?.message}>
            <Input {...register('category')} placeholder="Fresh Produce, Powder…" />
          </Field>
          <Field label="Unit" required>
            <Select {...register('unit')}>
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </Select>
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea {...register('description')} rows={2} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing & tax</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Selling price (₹)" required error={errors.price?.message}>
            <Input type="number" step="0.01" {...register('price')} />
          </Field>
          <Field label="Cost price (₹)" error={errors.costPrice?.message}>
            <Input type="number" step="0.01" {...register('costPrice')} />
          </Field>
          <Field label="GST %" required>
            <Select {...register('gstRate')}>
              {GST_RATES.map((r) => (
                <option key={r} value={r}>{r}%</option>
              ))}
            </Select>
          </Field>
          <Field label="Low-stock alert at" hint="Same unit as product">
            <Input type="number" step="0.01" {...register('lowStockThreshold')} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance & storage</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Country of origin">
            <Input {...register('countryOfOrigin')} />
          </Field>
          <Field label="Storage conditions">
            <Input {...register('storageConditions')} />
          </Field>
          <Field label="COA (Certificate of Analysis)" className="sm:col-span-2">
            <FileUpload
              value={coaUrl}
              onChange={setCoaUrl}
              variant="file"
              accept="image/*,application/pdf"
              folder="talari-erp/coa"
              label="Upload COA"
            />
          </Field>
          <Field label="Product images" className="sm:col-span-2">
            <div className="space-y-3">
              {images.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {images.map((url) => (
                    <div key={url} className="group relative size-20 overflow-hidden rounded-xl border border-border">
                      <Image src={url} alt="product" fill className="object-cover" sizes="80px" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                        className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
                        aria-label="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <FileUpload
                value={null}
                onChange={(url) => url && setImages((prev) => [...prev, url])}
                folder="talari-erp/products"
                label="Add image"
              />
            </div>
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isEdit ? 'Save changes' : 'Create product'}
        </Button>
      </div>
    </form>
  );
}
