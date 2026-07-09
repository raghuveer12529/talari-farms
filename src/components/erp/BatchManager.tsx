'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Plus, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Field } from '@/components/erp/Field';
import { FileUpload } from '@/components/erp/FileUpload';
import { toast } from '@/components/ui/sonner';
import { createBatch, type BatchInput } from '@/actions/products';
import { formatDate, formatNumber } from '@/lib/format';

interface BatchView {
  id: string;
  batchNumber: string;
  quantity: number;
  manufacturingDate: Date | null;
  expiryDate: Date | null;
  coaUrl: string | null;
}

export function BatchManager({
  productId,
  unit,
  batches,
}: {
  productId: string;
  unit: string;
  batches: BatchView[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [coaUrl, setCoaUrl] = React.useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BatchInput>({
    defaultValues: { productId, batchNumber: '', quantity: 0 },
  });

  const onSubmit = async (values: BatchInput) => {
    setSaving(true);
    const res = await createBatch({ ...values, productId, coaUrl });
    setSaving(false);
    if (res.ok) {
      toast.success('Batch added');
      setOpen(false);
      reset({ productId, batchNumber: '', quantity: 0 });
      setCoaUrl(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Batches</h3>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add batch
        </Button>
      </div>

      {batches.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No batches recorded.</p>
      ) : (
        <div className="divide-y divide-border">
          {batches.map((b) => (
            <div key={b.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <div className="font-medium text-foreground">{b.batchNumber}</div>
                <div className="text-xs text-muted-foreground">
                  {b.manufacturingDate ? `Mfg ${formatDate(b.manufacturingDate)}` : 'Mfg —'} ·{' '}
                  {b.expiryDate ? `Exp ${formatDate(b.expiryDate)}` : 'Exp —'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {b.coaUrl && (
                  <a href={b.coaUrl} target="_blank" rel="noopener noreferrer" className="text-primary" title="COA">
                    <FileText size={16} />
                  </a>
                )}
                <span className="tabular-nums font-semibold">
                  {formatNumber(b.quantity)} {unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Add batch">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Batch number" required error={errors.batchNumber?.message} className="sm:col-span-2">
              <Input {...register('batchNumber')} />
            </Field>
            <Field label={`Quantity (${unit})`} required error={errors.quantity?.message}>
              <Input type="number" step="0.01" {...register('quantity')} />
            </Field>
            <div />
            <Field label="Manufacturing date">
              <Input type="date" {...register('manufacturingDate')} />
            </Field>
            <Field label="Expiry date">
              <Input type="date" {...register('expiryDate')} />
            </Field>
            <Field label="COA" className="sm:col-span-2">
              <FileUpload value={coaUrl} onChange={setCoaUrl} variant="file" accept="image/*,application/pdf" folder="talari-erp/coa" label="Upload COA" />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />} Add batch
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
