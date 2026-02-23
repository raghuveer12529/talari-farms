import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { LogOut, User as UserIcon } from 'lucide-react';
import CartIcon from './CartIcon';

export default async function Navbar() {
    const session = await auth();
    const role = (session?.user as any)?.role;
    const userName = session?.user?.name || session?.user?.email?.split('@')[0];

    return (
        <nav className="sticky top-0 z-50 glass border-b border-primary/5 h-16 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-black/10 transition-transform duration-300 group-hover:scale-105 border border-primary/5 bg-black">
                    <img src="/logo.jpg" alt="Talari Farms Logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                    <span className="text-base font-bold tracking-tight text-primary leading-none">Talari Farms</span>
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-secondary">Purely Natural</span>
                </div>
            </Link>

            <div className="flex items-center gap-6 md:gap-8">
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-primary/80">
                    <Link href="/products" className="hover:text-primary transition-colors">Shop</Link>
                    {role === 'ADMIN' || role === 'PARTNER' ? (
                        <Link href="/admin" className="hover:text-primary transition-colors font-semibold text-primary">Dashboard</Link>
                    ) : null}
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <CartIcon />

                    {session ? (
                        <div className="flex items-center gap-3 md:gap-4 pl-2 border-l border-primary/10">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 leading-none mb-1">Welcome</span>
                                <span className="text-sm font-bold text-primary truncate max-w-[120px]">{userName}</span>
                            </div>

                            <div className="w-8 h-8 rounded-full bg-surface border border-primary/5 flex items-center justify-center text-primary/60">
                                <UserIcon size={16} />
                            </div>

                            <form action={async () => {
                                'use server';
                                await signOut();
                            }}>
                                <button className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors" title="Logout">
                                    <LogOut size={18} />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link href="/login" className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity bg-surface px-4 py-2 rounded-full border border-primary/5">
                            <UserIcon size={16} />
                            <span className="hidden sm:inline">Sign In</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
