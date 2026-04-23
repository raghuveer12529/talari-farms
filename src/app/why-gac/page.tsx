'use client';

import React, { useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Eye, HeartPulse, ShieldCheck, Zap, ArrowRight, Sun, Droplets, Leaf } from 'lucide-react';
import Link from 'next/link';

// 1. Hero Section
function HeroSection() {
    return (
        <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-stone-50">
            {/* Soft, natural light gradients */}
            <div className="absolute inset-0 bg-stone-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-200/40 via-red-100/20 to-stone-50 blur-3xl opacity-80 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.90, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 text-center space-y-8 max-w-5xl mx-auto"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 border border-orange-200/50 shadow-sm text-orange-600 backdrop-blur-md"
                >
                    <Sun size={14} className="animate-pulse" />
                    <span className="font-bold tracking-[0.25em] uppercase text-xs">The King of Fruits</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="text-6xl md:text-8xl lg:text-[10rem] font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-stone-900 via-orange-950 to-red-800 tracking-tight leading-none drop-shadow-sm"
                >
                    Why Gac?
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 1.2 }}
                    className="text-xl md:text-3xl text-stone-600 font-medium max-w-3xl mx-auto leading-relaxed"
                >
                    The world’s most powerful fruit you’ve never heard of.
                </motion.p>
            </motion.div>

            {/* Scroll indicator down */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-400"
            >
                <span className="text-xs uppercase tracking-widest font-bold">Discover</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-stone-300 to-transparent" />
            </motion.div>
        </section>
    );
}

// 2. Sticky Story Section
function StickyScrollSection() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });
    const [activeStep, setActiveStep] = useState(0);

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (latest < 0.3) setActiveStep(0);
        else if (latest < 0.55) setActiveStep(1);
        else if (latest < 0.75) setActiveStep(2);
        else setActiveStep(3);
    });

    const steps = [
        {
            id: 0,
            icon: <Leaf className="text-red-500 mb-6 w-8 h-8 md:w-12 md:h-12" />,
            title: "Not all fruits are created equal.",
            subtitle: "Traditionally used in Southeast Asia, Gac is now gaining global attention.",
            bgTitle: "01 / Nature's Secret",
            bgIcon: <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border border-red-200 flex items-center justify-center bg-white/60 backdrop-blur-3xl shadow-[0_20px_60px_rgba(220,38,38,0.15)] relative"><div className="absolute inset-0 bg-red-100 rounded-full blur-2xl block" /><Leaf className="w-10 h-10 md:w-16 md:h-16 text-red-500 relative z-10" /></div>,
            glow: "bg-red-300/40",
            bgStyle: "bg-red-50/80",
            accent: "text-red-600"
        },
        {
            id: 1,
            icon: <Zap className="text-orange-500 mb-6 w-8 h-8 md:w-12 md:h-12" />,
            title: <>Gac is one of the most <span className="text-orange-500">nutrient-dense</span> fruits on earth.</>,
            subtitle: "What makes it truly unique is the intensity of nutrients packed into a small serving.",
            bgTitle: "02 / The Density",
            bgIcon: <div className="w-40 h-40 md:w-64 md:h-64 rounded-full border border-orange-200 flex items-center justify-center bg-white/60 backdrop-blur-3xl shadow-[0_20px_80px_rgba(249,115,22,0.15)] relative"><div className="absolute inset-0 bg-orange-100 rounded-full blur-2xl block" /><Zap className="w-12 h-12 md:w-20 md:h-20 text-orange-500 relative z-10" /></div>,
            glow: "bg-orange-300/40",
            bgStyle: "bg-orange-50/80",
            accent: "text-orange-600"
        },
        {
            id: 2,
            icon: <ShieldCheck className="text-rose-500 mb-6 w-8 h-8 md:w-12 md:h-12" />,
            title: "Packed with rare antioxidants.",
            subtitle: "Defending your cells and boosting vitality naturally without synthetics.",
            bgTitle: "03 / The Shield",
            bgIcon: <div className="w-48 h-48 md:w-80 md:h-80 rounded-full border border-rose-200 flex items-center justify-center bg-white/60 backdrop-blur-3xl shadow-[0_20px_100px_rgba(244,63,94,0.15)] relative"><div className="absolute inset-0 bg-rose-100 rounded-full blur-3xl block" /><ShieldCheck className="w-14 h-14 md:w-24 md:h-24 text-rose-500 relative z-10" /></div>,
            glow: "bg-rose-300/40",
            bgStyle: "bg-rose-50/80",
            accent: "text-rose-600"
        },
        {
            id: 3,
            icon: <Sun className="text-amber-500 mb-6 w-8 h-8 md:w-12 md:h-12" />,
            title: <span className="flex flex-col gap-1 md:gap-2"><span>Designed by nature</span><span className="text-amber-500 italic">for powerful impact.</span></span>,
            subtitle: "It is not just a fruit—it is a functional superfood.",
            bgTitle: "04 / The Impact",
            bgIcon: <div className="w-56 h-56 md:w-96 md:h-96 rounded-full border border-amber-200 flex items-center justify-center bg-white/60 backdrop-blur-3xl shadow-[0_20px_120px_rgba(251,191,36,0.15)] relative"><div className="absolute inset-0 bg-amber-100 rounded-full blur-3xl block" /><Sun className="w-16 h-16 md:w-32 md:h-32 text-amber-500 relative z-10" /></div>,
            glow: "bg-amber-300/40",
            bgStyle: "bg-amber-50/80",
            accent: "text-amber-600"
        }
    ];

    const current = steps[activeStep];

    return (
        <section ref={targetRef} className="h-[600vh] relative bg-stone-50 border-y border-stone-200">
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col md:flex-row">

                {/* Left Text */}
                <div className="absolute top-0 left-0 w-full h-[50vh] md:relative md:w-1/2 md:h-full flex flex-col justify-center px-8 md:px-24 z-30 pointer-events-none md:pointer-events-auto">
                    <div className="relative w-full flex items-center justify-center md:justify-start lg:justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current.id}
                                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="flex flex-col justify-center w-full absolute pointer-events-auto items-center md:items-start text-center md:text-left"
                            >
                                <div className="hidden md:block">{current.icon}</div>
                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-stone-900 font-bold leading-[1.2]">
                                    {current.title}
                                </h2>
                                {current.subtitle && (
                                    <span className="text-base md:text-2xl text-stone-500 mt-4 md:mt-6 block font-sans">
                                        {current.subtitle}
                                    </span>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Visuals */}
                <div className="absolute inset-0 md:relative w-full md:w-1/2 h-full z-10 overflow-hidden bg-stone-50">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={`bg-${current.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2 }}
                            className={`absolute inset-0 flex items-center justify-center transition-colors duration-1000 ${current.bgStyle || 'bg-stone-50'} md:border-l border-stone-200`}
                        >
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] md:w-[150%] md:h-[150%] ${current.glow} blur-[100px] md:blur-[120px] opacity-80 pointer-events-none rounded-[100%]`} />

                            <div className="absolute bottom-0 left-0 w-full h-[50vh] md:relative md:w-full md:h-full z-10 flex flex-col items-center justify-center">
                                <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                                    {current.bgIcon}
                                </motion.div>
                                <div className="mt-8 md:mt-16 text-center space-y-2 md:space-y-4 px-4 md:px-0">
                                    <span className={`text-xs md:text-sm font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase ${current.accent}`}>
                                        {current.bgTitle.split(' / ')[0]}
                                    </span>
                                    <h3 className="text-3xl md:text-6xl font-serif text-stone-900 font-bold">
                                        {current.bgTitle.split(' / ')[1]}
                                    </h3>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

// 3. Nutrition Section
function NutritionSection() {
    const cards = [
        {
            title: "Beta-Carotene",
            icon: <Eye className="text-orange-500 w-8 h-8" />,
            desc: "Supports vision and skin health. Gac is exceptionally rich in this provitamin A.",
            border: "border-orange-100",
            shadow: "hover:shadow-orange-100"
        },
        {
            title: "Lycopene",
            icon: <HeartPulse className="text-red-500 w-8 h-8" />,
            desc: "A powerful antioxidant known for promoting heart and vascular health.",
            border: "border-red-100",
            shadow: "hover:shadow-red-100"
        },
        {
            title: "Vitamin E",
            icon: <ShieldCheck className="text-yellow-500 w-8 h-8" />,
            desc: "Helps protect cells from oxidative stress and boosts overall immunity.",
            border: "border-yellow-100",
            shadow: "hover:shadow-yellow-100"
        },
        {
            title: "Essential Fats",
            icon: <Droplets className="text-emerald-500 w-8 h-8" />,
            desc: "Naturally occurring fatty acids that drastically improve nutrient absorption.",
            border: "border-emerald-100",
            shadow: "hover:shadow-emerald-100"
        }
    ];

    return (
        <section className="py-32 px-6 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center mb-20 space-y-6"
                >
                    <h2 className="text-4xl md:text-6xl font-serif text-stone-900 font-bold">The Nutritional Profile</h2>
                    <p className="text-stone-500 text-lg md:text-xl max-w-2xl mx-auto">Gac is completely unique, combining vital fat-soluble antioxidants with the essential fats needed to absorb them.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: i * 0.1, duration: 0.8 }}
                            className={`p-8 rounded-[2rem] bg-white border ${card.border} group hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-stone-100/50 ${card.shadow} overflow-hidden relative`}
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 blur-xl scale-150 group-hover:opacity-10 transition-opacity">
                                {card.icon}
                            </div>
                            <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-stone-100 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                {card.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-4 relative z-10">{card.title}</h3>
                            <p className="text-stone-500 leading-relaxed relative z-10">{card.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// 4. Comparison Counters Section
function Counter({ value, suffix, text, color }: { value: number, suffix: string, text: string, color: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "center center"] });

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        setCount(Math.floor(latest * value));
    });

    return (
        <div ref={ref} className="text-center space-y-4">
            <div className={`text-7xl md:text-9xl lg:text-[10rem] font-serif font-black ${color} tracking-tighter drop-shadow-sm`}>
                {count}{suffix}
            </div>
            <div className="text-xl md:text-3xl text-stone-600 font-medium max-w-xs mx-auto">
                {text}
            </div>
        </div>
    );
}

function ComparisonSection() {
    return (
        <section className="py-40 px-6 bg-stone-50 relative overflow-hidden flex items-center justify-center border-y border-stone-200">
            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-20 md:gap-40">
                <Counter value={70} suffix="x" text="More lycopene than tomatoes" color="text-red-500" />
                <Counter value={10} suffix="x" text="More beta-carotene than carrots" color="text-orange-500" />
            </div>
        </section>
    );
}

// 5. Farming & Purity Section
function FarmingSection() {
    return (
        <section className="relative min-h-screen py-32 flex items-center justify-center bg-emerald-50 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-100 via-transparent to-transparent z-10" />
            </div>

            <div className="relative z-20 text-center max-w-4xl mx-auto px-6 space-y-12">
                <motion.h2
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1 }}
                    className="text-5xl md:text-8xl font-serif text-emerald-950 font-bold leading-tight"
                >
                    Pure. Rare.<br />
                    <span className="text-emerald-600 italic">Powerful.</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className="text-xl md:text-3xl text-emerald-800/80 font-serif max-w-2xl mx-auto leading-relaxed"
                >
                    At Talari Farms, we focus on growing Gac with care and responsibility. Naturally cultivated, carefully harvested, and minimally processed.
                </motion.p>
            </div>
        </section>
    );
}

// 6. CTA Section
function CTASection() {
    return (
        <section className="py-40 px-6 bg-white text-center relative overflow-hidden flex flex-col items-center justify-center">

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative z-10 space-y-12"
            >
                <h2 className="text-5xl md:text-7xl font-serif font-extrabold text-stone-900">
                    Add Gac to Your Life
                </h2>
                <div className="flex justify-center">
                    <Link href="/products" className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 p-[2px] rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-orange-500/20">
                        <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative flex items-center gap-3 bg-white px-8 py-4 rounded-full text-stone-900 font-bold text-lg group-hover:bg-transparent group-hover:text-white transition-colors duration-300">
                            Explore Products
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 text-orange-500 group-hover:text-white transition-all" />
                        </span>
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}

// Main Page
export default function WhyGacPage() {
    return (
        <div className="bg-stone-50 min-h-screen font-sans selection:bg-orange-500/30">
            <HeroSection />
            <StickyScrollSection />
            <NutritionSection />
            <ComparisonSection />
            <FarmingSection />
            <CTASection />
        </div>
    );
}
