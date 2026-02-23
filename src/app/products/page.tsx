import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="bg-white min-h-screen">
            <header className="pt-32 pb-16 px-6 max-w-7xl mx-auto text-center space-y-4">
                <span className="text-secondary font-bold tracking-[0.2em] uppercase text-[10px]">The Collection</span>
                <h1 className="heading-section text-primary">Our Fresh Harvest</h1>
                <p className="text-lg text-primary/40 max-w-2xl mx-auto font-medium">
                    Meticulously grown produce, harvested at the peak of ripeness and delivered to your doorstep.
                </p>
            </header>

            <div className="max-w-[1400px] mx-auto px-6 pb-32">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-32 text-center space-y-4">
                        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center">
                            <span className="text-primary/20 font-bold">!</span>
                        </div>
                        <p className="text-primary/40 font-medium italic">No products found in today's harvest. Check back soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
