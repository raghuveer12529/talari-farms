import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Leaf, ShieldCheck, Truck, ShoppingCart, Info, Award, Zap } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) notFound();

    return (
        <div className="bg-white">
            {/* HERO Showcase */}
            <div className="pt-24 md:pt-32 pb-16 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                    <div className="flex-1 w-full animate-in fade-in zoom-in-95 duration-1000">
                        <div className="relative aspect-square overflow-hidden rounded-[3rem] bg-surface border border-primary/5">
                            <img
                                src={product.image || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=1200&q=80'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
                        <div className="space-y-4">
                            <span className="px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/10">
                                {product.category}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary leading-tight">
                                {product.name}
                            </h1>
                            <div className="text-3xl font-medium text-primary/80">
                                ₹{product.price}
                            </div>
                        </div>

                        <p className="text-lg text-primary/60 font-medium leading-relaxed max-w-xl">
                            {product.description}
                        </p>

                        <div className="pt-4">
                            <AddToCartButton product={product} />
                        </div>

                        <div className="flex flex-wrap gap-6 pt-8 border-t border-primary/5">
                            <div className="flex items-center gap-2 text-primary/40">
                                <Leaf size={18} className="text-secondary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Organic Certified</span>
                            </div>
                            <div className="flex items-center gap-2 text-primary/40">
                                <Truck size={18} className="text-secondary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Next Day Delivery</span>
                            </div>
                            <div className="flex items-center gap-2 text-primary/40">
                                <ShieldCheck size={18} className="text-secondary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Zero Additives</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Story Sections */}
            <section className="apple-section bg-surface border-y border-primary/5">
                <div className="max-w-5xl mx-auto px-6 space-y-24">
                    <div className="text-center space-y-4">
                        <h2 className="heading-section text-primary">The Story of {product.name}</h2>
                        <p className="text-lg text-primary/60 font-medium max-w-2xl mx-auto">
                            Hand-picked at daybreak and delivered within hours to lock in every nutrient.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="bg-white p-10 rounded-[2rem] border border-primary/5 space-y-4 shadow-sm">
                            <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                                <Award size={24} />
                            </div>
                            <h4 className="text-xl font-bold text-primary">Superior Quality</h4>
                            <p className="text-sm text-primary/60 font-medium leading-relaxed">
                                Only 1 in 10 fruits pass our rigorous Talari Standard for color, size, and ripeness.
                            </p>
                        </div>
                        <div className="bg-white p-10 rounded-[2rem] border border-primary/5 space-y-4 shadow-sm">
                            <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                                <Zap size={24} />
                            </div>
                            <h4 className="text-xl font-bold text-primary">Bio-Active Power</h4>
                            <p className="text-sm text-primary/60 font-medium leading-relaxed">
                                Naturally dense in antioxidants and essential vitamins, supporting your daily wellness.
                            </p>
                        </div>
                        <div className="bg-white p-10 rounded-[2rem] border border-primary/5 space-y-4 shadow-sm">
                            <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                                <Info size={24} />
                            </div>
                            <h4 className="text-xl font-bold text-primary">Farm Traceable</h4>
                            <p className="text-sm text-primary/60 font-medium leading-relaxed">
                                Every batch comes with a direct link to the farmer who nurtured it. Complete transparency.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile Sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-primary/5 lg:hidden z-50">
                <AddToCartButton product={product} />
            </div>
        </div>
    );
}
