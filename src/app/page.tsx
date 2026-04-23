'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Leaf, ShieldCheck, Truck, Sparkles, Sun } from 'lucide-react';
import Link from 'next/link';

// --- Hero Section ---
function HeroSection() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-stone-50">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-200/40 via-yellow-100/20 to-transparent blur-3xl opacity-60 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center max-w-5xl mx-auto space-y-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 border border-stone-200 text-stone-600 shadow-sm backdrop-blur-md"
        >
          <Leaf size={14} className="text-emerald-500" />
          <span className="font-bold tracking-[0.2em] uppercase text-xs">Fresh From the Soil</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-6xl md:text-8xl lg:text-[9rem] font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-stone-900 via-orange-950 to-stone-800 tracking-tight leading-[1] drop-shadow-sm pb-4"
        >
          Talari Farms.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-xl md:text-3xl text-stone-500 font-medium max-w-2xl mx-auto leading-relaxed"
        >
          Nature’s most powerful harvest, cultivated with care and delivered directly to you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/products" className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 p-[2px] rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-orange-500/20 w-full sm:w-auto">
            <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2 bg-white px-8 py-4 rounded-full text-stone-900 font-bold text-lg group-hover:bg-transparent group-hover:text-white transition-colors duration-300 w-full h-full">
              Explore Harvest
              <ArrowRight size={20} className="text-orange-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </span>
          </Link>

          <Link href="/about" className="group flex items-center justify-center gap-2 px-8 py-4 rounded-full text-stone-600 font-bold text-lg hover:bg-stone-200/50 transition-colors w-full sm:w-auto">
            Our Story
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// --- Cinematic Bento Grid / Features ---
function FeaturedPromises() {
  return (
    <section className="py-32 px-6 bg-white relative z-10 border-t border-stone-200">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24 space-y-6"
        >
          <h2 className="text-4xl md:text-6xl font-serif text-stone-900 font-bold">The Talari Standard</h2>
          <p className="text-stone-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            We don't just grow food; we cultivate health. Every seed is nurtured exactly as nature intended it to be.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vertical Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="bg-emerald-50 rounded-[2.5rem] p-10 flex flex-col justify-between group overflow-hidden relative border border-emerald-100 shadow-xl shadow-emerald-900/5 transition-transform hover:-translate-y-2 lg:col-span-1"
          >
            <div className="absolute top-0 right-0 -m-8 mix-blend-overlay opacity-30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
              <Leaf className="w-64 h-64 text-emerald-500" />
            </div>
            <div className="relative z-10 mb-32">
              <h3 className="text-3xl font-serif font-bold text-stone-900 mb-4">100% natural Origin.</h3>
              <p className="text-stone-600 font-medium leading-relaxed">
                Our soil is treated with absolute respect. No synthetic chemicals, ensuring everything you consume is pure.
              </p>
            </div>
          </motion.div>

          {/* Horizontal Features Group */}
          <div className="lg:col-span-2 grid grid-rows-2 gap-8">
            {/* Box 1 */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="bg-orange-50 rounded-[2.5rem] p-10 flex flex-col sm:flex-row items-center sm:items-end justify-between group relative overflow-hidden border border-orange-100 shadow-xl shadow-orange-900/5 transition-transform hover:-translate-y-2"
            >
              <div className="absolute -left-10 -bottom-10 mix-blend-overlay opacity-30 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700">
                <Sun className="w-56 h-56 text-orange-500" />
              </div>
              <div className="relative z-10 max-w-sm mb-6 sm:mb-0">
                <h3 className="text-3xl font-serif font-bold text-stone-900 mb-4">Gac Specialist.</h3>
                <p className="text-stone-600 font-medium leading-relaxed">
                  We are dedicated cultivators of Gac Fruit, harnessing its incredible nutrient density globally.
                </p>
              </div>
              <Link href="/why-gac" className="relative z-10 w-full sm:w-auto text-center sm:text-left bg-white text-orange-600 px-6 py-3 rounded-full font-bold shadow-sm hover:shadow-md transition-shadow">
                Why Gac?
              </Link>
            </motion.div>

            {/* Box 2 */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="bg-stone-100 rounded-[2.5rem] p-10 flex flex-col sm:flex-row items-center sm:items-end justify-between group relative overflow-hidden border border-stone-200 shadow-xl shadow-stone-900/5 transition-transform hover:-translate-y-2"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 mix-blend-overlay opacity-20 group-hover:scale-110 group-hover:translate-x-4 transition-all duration-700">
                <Truck className="w-56 h-56 text-stone-400" />
              </div>
              <div className="relative z-10 max-w-sm mb-6 sm:mb-0">
                <h3 className="text-3xl font-serif font-bold text-stone-900 mb-4">Direct to You.</h3>
                <p className="text-stone-600 font-medium leading-relaxed">
                  No middlemen. We harvest in the morning and begin the delivery process immediately.
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0 shadow-lg relative z-10">
                <ShieldCheck size={24} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Cinematic Spotlight Component ---
function SpotlightSection() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start end", "end start"] });

  // Create an intense zoom-in effect as the user scrolls
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={targetRef} className="h-[100vh] relative bg-stone-950 flex items-center justify-center overflow-hidden border-y border-stone-800">
      <motion.div
        style={{ scale, opacity }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-red-900/40 to-stone-950 pointer-events-none"
      />

      <div className="relative z-10 text-center px-6 max-w-4xl space-y-8">
        <motion.div style={{ opacity }} className="space-y-8">
          <h2 className="text-5xl md:text-8xl font-serif text-white font-bold leading-tight">
            Power in <br />
            <span className="italic text-orange-500 font-light">Every Seed.</span>
          </h2>
          <p className="text-xl md:text-3xl text-white/60 font-serif leading-relaxed">
            Experience the vitality of nature's rarest superfoods.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// --- Bottom Navigation Flow ---
function BottomCTA() {
  return (
    <section className="py-40 px-6 bg-stone-50 border-t border-stone-200">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="text-center max-w-4xl mx-auto space-y-12"
      >
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-stone-600 border border-stone-200 shadow-sm">
          <Sparkles size={14} className="text-emerald-500" />
          <span className="font-bold tracking-[0.2em] uppercase text-xs">Begin the flow</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-serif font-extrabold text-stone-900 leading-[1.2]">
          Ready to feel the difference?
        </h2>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link href="/products" className="group inline-flex items-center justify-center gap-2 bg-stone-900 px-8 py-4 rounded-full text-white font-bold text-lg hover:bg-stone-800 transition-all hover:scale-105 shadow-xl shadow-stone-900/10">
            Shop the Farm
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/contact" className="group inline-flex items-center justify-center gap-2 bg-white px-8 py-4 rounded-full text-stone-900 font-bold text-lg hover:bg-stone-100 transition-all border border-stone-200 hover:scale-105 shadow-sm">
            Get in Touch
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="bg-stone-50 min-h-screen selection:bg-orange-200 selection:text-orange-900">
      <HeroSection />
      <FeaturedPromises />
      <SpotlightSection />
      <BottomCTA />
    </main>
  );
}
