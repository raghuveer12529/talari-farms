import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, ListOrdered, IndianRupee, Settings, User as UserIcon } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== 'ADMIN' && role !== 'PARTNER') {
        redirect('/');
    }

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-stone-50">
            <AdminSidebar role={role} />

            {/* Content */}
            <main className="flex-1 p-4 sm:p-6 md:p-10">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div >
    );
}
