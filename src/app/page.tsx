import Link from 'next/link';
import { ArrowRight, Leaf, ShieldCheck, Truck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section - GAC Fruit Showcase */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-gac.png"
            alt="Premium GAC Fruit"
            className="w-full h-full object-cover"
          />
          {/* Enhanced overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <span className="text-secondary/90 font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs mb-8 block drop-shadow-sm">
            RARE • ORGANIC • FARM-GROWN
          </span>
          <h1 className="heading-hero text-white mb-8 drop-shadow-2xl">
            Gac Fruit. <br />
            <span className="text-white/90">Nature’s Most Powerful Red.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
            Exceptionally rich in natural lycopene, cultivated with care at Talari Farms.
          </p>
          <p className="text-xs md:text-sm mb-12 text-white/60 tracking-wide uppercase font-medium">
            Up to 70× more lycopene than tomatoes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/products" className="btn-apple btn-apple-primary w-full sm:w-auto">
              Explore Harvest
            </Link>
            <Link href="/about" className="btn-apple btn-apple-secondary w-full sm:w-auto">
              Our Process
            </Link>
          </div>
        </div>
      </section>

      {/* Storytelling Section 1: Quality */}
      <section className="apple-section bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
                alt="Organic Farming"
                className="rounded-[2.5rem] shadow-2xl shadow-primary/10"
              />
            </div>
            <div className="order-1 md:order-2 space-y-8">
              <h2 className="heading-section text-primary">Purely Organic. <br /><span className="text-primary/40">Nothing else.</span></h2>
              <p className="text-xl text-primary/60 leading-relaxed font-medium">
                We believe the best food comes from soil that's treated with respect. Our 100% organic methods ensure every bite is as nature intended.
              </p>
              <div className="pt-4">
                <Link href="/quality" className="text-primary font-bold inline-flex items-center gap-2 group border-b-2 border-primary/5 pb-1 hover:border-primary/20 transition-all">
                  Learn about our standards <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Storytelling Section 2: Farm to Home */}
      <section className="apple-section bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="heading-section text-primary">From Our Soil <br /><span className="text-primary/40">To Your Table.</span></h2>
              <p className="text-xl text-primary/60 leading-relaxed font-medium">
                Efficiency meets tradition. We harvest in the morning and begin our delivery process immediately, ensuring maximum nutrient retention.
              </p>
              <div className="flex flex-col gap-6 pt-4">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-primary/5">
                    <Truck size={20} className="text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Direct Delivery</h4>
                    <p className="text-sm text-primary/50 font-medium">No middlemen. Just farm to home.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-primary/5">
                    <ShieldCheck size={20} className="text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Certified Quality</h4>
                    <p className="text-sm text-primary/50 font-medium">Every harvest is double-checked.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"
                alt="Talari Farms Sunset"
                className="rounded-[2.5rem] shadow-2xl shadow-primary/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Teaser */}
      <section className="apple-section bg-white text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <h2 className="heading-section text-primary">Experience the Harvest</h2>
          <p className="text-xl text-primary/60 font-medium">
            From vibrant Gac Fruit to delicate Dragon Fruit, explore our seasonal selections.
          </p>
          <div className="pt-10">
            <Link href="/products" className="btn-apple btn-apple-primary px-12 py-5 text-lg">
              Shop the Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-12 border-y border-primary/5 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Organic</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">24h</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Farm to Fork</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">5k+</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Happy Homes</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">Partner</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Owned & Managed</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
