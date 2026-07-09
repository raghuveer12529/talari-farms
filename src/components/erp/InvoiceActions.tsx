'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Copy, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/erp/ConfirmButton';
import { toast } from '@/components/ui/sonner';
import {
  finalizeInvoice,
  cancelInvoice,
  duplicateInvoice,
  deleteInvoice,
} from '@/actions/invoices';

export function InvoiceActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();

  const finalize = () =>
    start(async () => {
      const res = await finalizeInvoice(id);
      if (res.ok) {
        toast.success('Invoice finalized — stock updated');
        router.refresh();
      } else toast.error(res.error);
    });

  const duplicate = () =>
    start(async () => {
      const res = await duplicateInvoice(id);
      if (res.ok && res.id) {
        toast.success('Invoice duplicated');
        router.push(`/app/invoices/${res.id}`);
      } else if (!res.ok) toast.error(res.error);
    });

  return (
    <>
      {status === 'DRAFT' && (
        <Button onClick={finalize} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          Finalize
        </Button>
      )}

      <Button variant="outline" onClick={duplicate} disabled={pending}>
        <Copy className="size-4" /> Duplicate
      </Button>

      {status !== 'CANCELLED' && status !== 'DRAFT' && (
        <ConfirmButton
          variant="outline"
          action={() => cancelInvoice(id)}
          confirmTitle="Cancel invoice?"
          confirmMessage="This marks the invoice cancelled and reverses any stock deducted."
          confirmLabel="Cancel invoice"
          successMessage="Invoice cancelled"
        >
          <XCircle className="size-4" /> Cancel
        </ConfirmButton>
      )}

      {status === 'DRAFT' && (
        <ConfirmButton
          variant="outline"
          action={() => deleteInvoice(id)}
          confirmTitle="Delete draft?"
          confirmMessage="This permanently deletes the draft invoice."
          successMessage="Draft deleted"
          redirectTo="/app/invoices"
        >
          <XCircle className="size-4" /> Delete
        </ConfirmButton>
      )}
    </>
  );
}
