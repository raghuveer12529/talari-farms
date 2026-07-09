import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

interface AuditInput {
  action: string; // e.g. "invoice.create"
  entity: string; // e.g. "Invoice"
  entityId?: string | null;
  summary: string; // human-readable, e.g. "Created invoice TF/26-27/0001"
  metadata?: Prisma.InputJsonValue;
}

/**
 * Record an audit-log entry for the current user. Best-effort: failures are
 * swallowed so auditing can never break the primary action.
 */
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    const session = await auth();
    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id ?? null,
        userName: session?.user?.name ?? session?.user?.email ?? 'system',
        userRole: (session?.user?.role as string | undefined) ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        summary: input.summary,
        metadata: input.metadata,
      },
    });
  } catch (err) {
    console.error('Audit log write failed', err);
  }
}
