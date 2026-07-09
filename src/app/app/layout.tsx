import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ErpSidebar from '@/components/erp/ErpSidebar';
import { Topbar } from '@/components/erp/Topbar';
import { Toaster } from '@/components/ui/sonner';
import { hasErpAccess, type Role } from '@/lib/permissions';

export const metadata = { title: 'ERP | Talari Farms', robots: { index: false } };

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/ledger/login?from=/app');

  const role = (session.user.role ?? 'VIEWER') as Role;
  // Legacy ledger partners don't have ERP access — send them to the ledger.
  if (!hasErpAccess(role)) redirect('/ledger');

  const userName = session.user.name ?? 'User';

  return (
    <div className="erp min-h-screen bg-gradient-warm">
      <ErpSidebar role={role} userName={userName} />
      <div className="lg:ml-64">
        <Topbar />
        <main className="min-h-screen">
          <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pt-6">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
