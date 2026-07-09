import { Badge } from '@/components/ui/badge';

type Status = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'CANCELLED';

const map: Record<Status, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  DRAFT: { label: 'Draft', variant: 'muted' },
  SENT: { label: 'Sent', variant: 'default' },
  PARTIAL: { label: 'Partial', variant: 'warning' },
  PAID: { label: 'Paid', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
};

export function InvoiceStatusBadge({ status }: { status: Status }) {
  const cfg = map[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
