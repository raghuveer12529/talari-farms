'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { useCartStore } from '@/store/cart';

interface LogoutButtonProps {
    className?: string;
    variant?: 'icon' | 'text';
    onLogout?: () => void;
}

export default function LogoutButton({ className, variant = 'icon', onLogout }: LogoutButtonProps) {
    const clearCart = useCartStore((state) => state.clearCart);

    const handleLogout = async () => {
        // 1. Clear the client-side cart store
        clearCart();

        // 2. Clear any other client-side state if needed
        // (Optional: clear localStorage if there prefix-based keys)

        // 3. Callback if provided (e.g. close mobile menu)
        onLogout?.();

        // 4. Perform the actual sign out and redirect
        await signOut({ callbackUrl: '/' });
    };

    if (variant === 'text') {
        return (
            <button
                onClick={handleLogout}
                className={className}
            >
                <LogOut size={18} className="text-stone-400" />
                Sign Out
            </button>
        );
    }

    return (
        <button
            onClick={handleLogout}
            className={className}
            title="Logout"
        >
            <LogOut size={16} />
        </button>
    );
}
