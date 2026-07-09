'use client';

import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { inputClasses } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Server-driven search: updates the `q` query param (debounced) and resets to
 * page 1. The page is a server component that reads `q` and filters in the DB.
 */
export function SearchBox({ placeholder = 'Search…' }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = React.useState(params.get('q') ?? '');

  const push = React.useCallback(
    (q: string) => {
      const sp = new URLSearchParams(params.toString());
      if (q) sp.set('q', q);
      else sp.delete('q');
      sp.delete('page');
      router.replace(`${pathname}${sp.toString() ? `?${sp}` : ''}`);
    },
    [params, pathname, router],
  );

  React.useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get('q') ?? '') !== value) push(value);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(inputClasses, 'pl-9 pr-9')}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
