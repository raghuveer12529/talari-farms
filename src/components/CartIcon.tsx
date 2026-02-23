'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCartItemCount } from '@/store/cart';

export default function CartIcon() {
    const itemCount = useCartItemCount();

    return (
        <Link href="/cart" className="relative p-2.5 hover:bg-primary/5 rounded-full transition-all duration-300 text-primary group">
            <ShoppingCart size={22} className="group-hover:scale-110 transition-transform duration-300" />
            {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] px-1.5 flex items-center justify-center bg-secondary text-white text-[10px] font-bold rounded-full shadow-lg shadow-secondary/20 animate-in zoom-in duration-300">
                    {itemCount}
                </span>
            )}
        </Link>
    );
}
