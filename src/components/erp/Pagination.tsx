import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  basePath: string;
  currentPage: number;
  totalPages: number;
  /** Extra query params to preserve (e.g. { q: 'acme' }). */
  params?: Record<string, string | undefined>;
  total?: number;
  pageSize?: number;
}

function hrefFor(basePath: string, page: number, params?: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  if (params) for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  if (page > 1) sp.set('page', String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ basePath, currentPage, totalPages, params, total, pageSize }: PaginationProps) {
  if (totalPages <= 1) {
    return total != null && total > 0 ? (
      <p className="text-right text-xs text-muted-foreground">{total} total</p>
    ) : null;
  }

  const prev = Math.max(1, currentPage - 1);
  const next = Math.min(totalPages, currentPage + 1);

  // Compact window of page numbers around the current page.
  const pages: number[] = [];
  const from = Math.max(1, currentPage - 2);
  const to = Math.min(totalPages, currentPage + 2);
  for (let p = from; p <= to; p++) pages.push(p);

  const rangeLabel =
    total != null && pageSize != null
      ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, total)} of ${total}`
      : `Page ${currentPage} of ${totalPages}`;

  const linkCls = 'flex h-9 min-w-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted';

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <span className="text-xs text-muted-foreground">{rangeLabel}</span>
      <div className="flex items-center gap-1.5">
        <Link
          href={hrefFor(basePath, prev, params)}
          aria-disabled={currentPage === 1}
          className={cn(linkCls, currentPage === 1 && 'pointer-events-none opacity-40')}
        >
          <ChevronLeft className="size-4" />
        </Link>
        {from > 1 && <span className="px-1 text-muted-foreground">…</span>}
        {pages.map((p) => (
          <Link
            key={p}
            href={hrefFor(basePath, p, params)}
            className={cn(linkCls, p === currentPage && 'border-primary bg-primary text-primary-foreground')}
          >
            {p}
          </Link>
        ))}
        {to < totalPages && <span className="px-1 text-muted-foreground">…</span>}
        <Link
          href={hrefFor(basePath, next, params)}
          aria-disabled={currentPage === totalPages}
          className={cn(linkCls, currentPage === totalPages && 'pointer-events-none opacity-40')}
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
