'use client';

import { Product } from '@prisma/client';
import { ShoppingCart, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);

    const addToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product, 1);
        alert(`${product.name} added to cart!`);
    };

    return (
        <Link href={`/products/${product.id}`} className="group block bg-white rounded-[2rem] overflow-hidden border border-primary/5 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                <img
                    src={product.image || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute top-6 left-6">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">
                        {product.category}
                    </span>
                </div>

                <div className="absolute bottom-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <button
                        onClick={addToCart}
                        className="w-12 h-12 bg-white text-primary rounded-full shadow-lg flex items-center justify-center hover:bg-secondary hover:text-white transition-colors duration-300"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            <div className="p-8 space-y-2">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold tracking-tight text-primary group-hover:text-secondary transition-colors duration-300">{product.name}</h3>
                    <span className="text-lg font-bold text-primary/80">₹{product.price}</span>
                </div>
                <p className="text-sm text-primary/40 font-medium line-clamp-1 italic">"{product.description}"</p>
                <div className="pt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary/30">
                    <span>View Details</span>
                </div>
            </div>
        </Link>
    );
}
