'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  /** May return a refusal (e.g. deleting income already spent against). */
  action: () => Promise<void | { ok: boolean; error?: string }>;
  label?: string;
}

export default function DeleteButton({ action, label = 'Delete' }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleClick() {
    if (!confirm(`Are you sure you want to delete this ${label.toLowerCase()}?`)) return;
    setError('');
    startTransition(async () => {
      const result = await action();
      if (result && result.ok === false) setError(result.error ?? 'Could not delete.');
    });
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={pending}
        className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-40"
        title={`Delete ${label}`}
      >
        <Trash2 size={15} />
      </button>
      {error && (
        <p role="alert" className="text-[11px] text-red-600 font-semibold mt-1 max-w-[220px] text-right">
          {error}
        </p>
      )}
    </>
  );
}
