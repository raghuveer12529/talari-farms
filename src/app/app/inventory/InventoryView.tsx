'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Field } from '@/components/erp/Field';
import { toast } from '@/components/ui/sonner';
import { adjustStock, type AdjustInput } from '@/actions/inventory';
import { formatNumber, formatDateTime } from '@/lib/format';

export interface InventoryRow {
  id: string;
  name: string;
  sku: string;
  unit: string;
  current: number;
  available: number;
  reserved: number;
  lowStockThreshold: number;
}

export interface MovementRow {
  id: string;
  productName: string;
  type: string;
  quantity: number;
  unit: string;
  reason: string | null;
  createdAt: Date;
}

const typeBadge: Record<string, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  IN: { label: 'Stock In', variant: 'success' },
  OUT: { label: 'Stock Out', variant: 'danger' },
  ADJUST: { label: 'Adjustment', variant: 'warning' },
  RESERVE: { label: 'Reserved', variant: 'muted' },
  RELEASE: { label: 'Released', variant: 'muted' },
};

export function InventoryView({ rows, movements }: { rows: InventoryRow[]; movements: MovementRow[] }) {
  const router = useRouter();
  const [target, setTarget] = React.useState<InventoryRow | null>(null);
  const [saving, setSaving] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AdjustInput>({
    defaultValues: { direction: 'IN', quantity: 0, reason: '' },
  });

  const openFor = (row: InventoryRow) => {
    reset({ productId: row.id, direction: 'IN', quantity: 0, reason: '' });
    setTarget(row);
  };

  const onSubmit = async (values: AdjustInput) => {
    if (!target) return;
    setSaving(true);
    const res = await adjustStock({ ...values, productId: target.id });
    setSaving(false);
    if (res.ok) {
      toast.success('Stock updated');
      setTarget(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Product</TableHead>
                <TableHead>On hand</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const low = r.lowStockThreshold > 0 && r.current <= r.lowStockThreshold;
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-semibold text-foreground">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.sku}</div>
                    </TableCell>
                    <TableCell className="tabular-nums">{formatNumber(r.current)} {r.unit}</TableCell>
                    <TableCell className="tabular-nums">{formatNumber(r.available)} {r.unit}</TableCell>
                    <TableCell className="tabular-nums">{formatNumber(Math.max(0, r.reserved))} {r.unit}</TableCell>
                    <TableCell>
                      {low ? <Badge variant="warning">Low stock</Badge> : <Badge variant="success">OK</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openFor(r)}>
                        <SlidersHorizontal className="size-4" /> Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 font-semibold text-foreground">Recent stock movements</h3>
        <Card>
          <CardContent className="p-0">
            {movements.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No movements yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDateTime(m.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">{m.productName}</TableCell>
                      <TableCell>
                        <Badge variant={typeBadge[m.type]?.variant}>{typeBadge[m.type]?.label ?? m.type}</Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">{formatNumber(m.quantity)} {m.unit}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.reason ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!target} onClose={() => setTarget(null)} title={`Adjust stock — ${target?.name ?? ''}`}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody className="space-y-4">
            <Field label="Movement type" required>
              <Select {...register('direction')}>
                <option value="IN">Stock In (add)</option>
                <option value="OUT">Stock Out (remove)</option>
                <option value="ADJUST">Adjustment (signed)</option>
              </Select>
            </Field>
            <Field label={`Quantity (${target?.unit ?? ''})`} required error={errors.quantity?.message} hint="For Adjustment, use a negative value to decrease.">
              <Input type="number" step="0.01" {...register('quantity')} />
            </Field>
            <Field label="Reason" required error={errors.reason?.message}>
              <Input {...register('reason')} placeholder="Production, wastage, stocktake…" />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTarget(null)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
