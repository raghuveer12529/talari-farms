'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /** Accessible title; rendered as the header if `title` text is provided. */
  title?: React.ReactNode;
  description?: React.ReactNode;
}

/**
 * Lightweight controlled modal: portal + backdrop blur, Escape to close,
 * scroll lock. Must be rendered inside the `.erp` subtree so it inherits the
 * green theme tokens — the portal mounts a `.erp` wrapper to guarantee that.
 */
export function Dialog({ open, onClose, children, className, title, description }: DialogProps) {
  const [mounted, setMounted] = React.useState(false);
  const isDark = React.useRef(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    // Carry the current dark-mode state into the portal (which renders at body level).
    isDark.current = document.documentElement.classList.contains('dark');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className={cn('erp', isDark.current && 'dark')}>
      <div
        className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-foreground/30 p-4 backdrop-blur-sm sm:items-center"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={cn(
            'relative my-8 w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground shadow-card-premium',
            className,
          )}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          {(title || description) && (
            <div className="border-b border-border px-6 py-4">
              {title && <h2 className="text-lg font-bold text-foreground">{title}</h2>}
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-5', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end gap-3 border-t border-border px-6 py-4', className)}
      {...props}
    />
  );
}
