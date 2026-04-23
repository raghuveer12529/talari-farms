import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { LogOut, User as UserIcon } from 'lucide-react';
import CartIcon from './CartIcon';
import MobileMenu from './MobileMenu';
import LogoutButton from './LogoutButton';

export default async function Navbar() {
    const session = await auth();
    const role = (session?.user as any)?.role;
    const userName = session?.user?.name || session?.user?.email?.split('@')[0];

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b border-stone-200/60 h-16 px-4 sm:px-6 md:px-12 flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-105 border border-stone-200/50">
                    <img src="/logo.jpg" alt="Talari Farms Logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold tracking-tight text-primary leading-none">Talari Farms</span>
                    <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.2em] text-secondary">Purely Natural</span>
                </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-primary/70">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <Link href="/about" className="hover:text-primary transition-colors">Our Story</Link>
                <Link href="/why-gac" className="hover:text-primary transition-colors text-orange-600">Why Gac?</Link>
                <Link href="/products" className="hover:text-primary transition-colors">Shop</Link>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                {role === 'ADMIN' || role === 'PARTNER' ? (
                    <Link href="/admin" className="hover:text-primary transition-colors font-semibold text-primary">Dashboard</Link>
                ) : null}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-1 sm:gap-2">
                <CartIcon />

                {session ? (
                    <>
                        {/* User info — hidden on mobile */}
                        <Link href="/profile" className="hidden sm:flex items-center gap-2 ml-2 pl-3 border-l border-stone-200/60 group/user transition-opacity hover:opacity-80">
                            <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200/60 flex items-center justify-center text-primary/50 group-hover/user:bg-primary/5 group-hover/user:text-primary transition-colors">
                                <UserIcon size={15} />
                            </div>
                            <div className="hidden lg:flex flex-col">
                                <span className="text-[10px] font-semibold text-stone-400 leading-none mb-0.5">Welcome</span>
                                <span className="text-xs font-bold text-primary truncate max-w-[100px] group-hover/user:text-secondary transition-colors">{userName}</span>
                            </div>
                        </Link>

                        {/* Logout — hidden on small mobile */}
                        <LogoutButton
                            className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        />
                    </>
                ) : (
                    <Link href="/login" className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200/60 ml-1">
                        <UserIcon size={14} />
                        <span className="hidden sm:inline text-xs">Sign In</span>
                    </Link>
                )}

                {/* Mobile Menu — single unified hamburger */}
                <MobileMenu role={role} />
            </div>
        </nav>
    );
}
