'use client';

import { Product } from '@prisma/client';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function AddToCartButton({ product }: { product: Product }) {
    const addItem = useCartStore((state) => state.addItem);

    const addToCart = () => {
        addItem(product, 1);
        alert(`${product.name} added to cart!`);
    };

    return (
        <button
            onClick={addToCart}
            className="btn-apple btn-apple-primary w-full py-5 text-lg shadow-xl shadow-primary/10 flex items-center justify-center gap-3 transition-all"
        >
            <ShoppingCart size={22} /> Add to Basket
        </button>
    );
}
