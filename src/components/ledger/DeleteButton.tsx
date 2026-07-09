'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  action: () => Promise<void>;
  label?: string;
}

export default function DeleteButton({ action, label = 'Delete' }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Are you sure you want to delete this ${label.toLowerCase()}?`)) return;
    startTransition(async () => {
      await action();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-40"
      title={`Delete ${label}`}
    >
      <Trash2 size={15} />
    </button>
  );
}
