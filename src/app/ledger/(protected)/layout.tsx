import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LedgerSidebar from '@/components/ledger/LedgerSidebar';

export const metadata = { title: 'Ledger | Talari Farms', robots: { index: false } };

export default async function LedgerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect('/ledger/login');

  const role = (session.user as { role: 'ADMIN' | 'PARTNER' }).role;
  const userName = session.user.name ?? 'Partner';

  return (
    <div className="min-h-screen bg-gradient-warm">
      <LedgerSidebar role={role} userName={userName} />
      <main className="lg:ml-60 min-h-screen">
        <div className="pt-20 lg:pt-10 px-4 sm:px-6 lg:px-10 pb-10 max-w-5xl mx-auto lg:mx-0">
          {children}
        </div>
      </main>
    </div>
  );
}
