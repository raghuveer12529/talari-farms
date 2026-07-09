'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';

interface ActionResult {
  ok: boolean;
  error?: string;
}

interface ConfirmButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** Bound server action, e.g. deleteCustomer.bind(null, id) */
  action: () => Promise<ActionResult>;
  confirmTitle?: string;
  confirmMessage?: string;
  confirmLabel?: string;
  successMessage?: string;
  /** Navigate here after success instead of refreshing. */
  redirectTo?: string;
}

export function ConfirmButton({
  action,
  confirmTitle = 'Are you sure?',
  confirmMessage = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  successMessage = 'Done',
  redirectTo,
  children,
  ...buttonProps
}: ConfirmButtonProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const res = await action();
      if (res.ok) {
        toast.success(successMessage);
        setOpen(false);
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } else {
        toast.error(res.error ?? 'Something went wrong');
      }
    });
  };

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} {...buttonProps}>
        {children}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={confirmTitle} className="max-w-md">
        <DialogBody>
          <p className="text-sm text-muted-foreground">{confirmMessage}</p>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
