import { redirect } from 'next/navigation';
import { ScrollText } from 'lucide-react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/erp/PageHeader';
import { EmptyState } from '@/components/erp/EmptyState';
import { Pagination } from '@/components/erp/Pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/format';
import type { Role } from '@/lib/permissions';

export const metadata = { title: 'Audit log | Talari Farms ERP' };

const PAGE_SIZE = 25;

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await auth();
  // Audit log is admin-only.
  if ((session?.user?.role as Role) !== 'ADMIN') redirect('/app');

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description="Every create, update, and delete across the ERP." />

      {total === 0 ? (
        <EmptyState icon={ScrollText} title="No activity yet" description="Actions will appear here as they happen." />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>When</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="font-medium text-foreground">{log.userName}</span>
                        {log.userRole && (
                          <span className="ml-1 text-xs text-muted-foreground">({log.userRole})</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted" className="font-mono text-[11px]">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90">{log.summary}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Pagination basePath="/app/audit" currentPage={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} />
        </>
      )}
    </div>
  );
}
