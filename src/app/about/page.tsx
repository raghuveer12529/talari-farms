'use client';

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Leaf, Heart, Sparkles, ArrowRight, Sprout } from 'lucide-react';
import Link from 'next/link';

// --- Hero Section ---
function HeroSection() {
    return (
        <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-white" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-white to-orange-50/30" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 text-center space-y-8 max-w-4xl mx-auto"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-50 border border-stone-100 text-stone-500 backdrop-blur-sm"
                >
                    <Leaf size={14} />
                    <span className="font-bold tracking-[0.2em] uppercase text-[10px]">Our Story</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-primary tracking-tight leading-tight"
                >
                    From Weekends to a Purpose
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="text-lg md:text-2xl text-primary/60 font-medium max-w-2xl mx-auto leading-relaxed"
                >
                    We are three professionals who chose to grow something real.
                </motion.p>
            </motion.div>
        </section>
    );
}

// --- Founders Section ---
function FoundersSection() {
    const founders = [
        { name: "Raghuveer Talari", role: "Software Engineer", icon: "💻" },
        { name: "Siva Sankar Talari", role: "Software Engineer", icon: "💻" },
        { name: "Pulender Naidu Talari", role: "Doctor", icon: "🩺" }
    ];

    return (
        <section className="py-32 px-6 bg-surface z-10 relative">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 space-y-4"
                >
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary">The People Behind the Farm</h2>
                    <p className="text-primary/50 text-lg font-medium max-w-xl mx-auto">Balancing careers with a passion for the earth.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {founders.map((founder, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/50 flex flex-col items-center text-center space-y-6 group hover:border-emerald-100 transition-colors"
                        >
                            <div className="w-24 h-24 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                                {founder.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-primary">{founder.name}</h3>
                                <p className="text-sm font-bold uppercase tracking-widest text-primary/40 mt-2">{founder.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// --- Sticky Story Section ---
function StorySection() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    const [activeStep, setActiveStep] = useState(0);

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        // Expanded scroll brackets give much longer reading time to the first and last slides.
        if (latest < 0.30) setActiveStep(0);
        else if (latest < 0.55) setActiveStep(1);
        else if (latest < 0.75) setActiveStep(2);
        else setActiveStep(3);
    });

    const steps = [
        {
            id: 0,
            icon: <Leaf className="text-stone-500 mb-6 w-8 h-8 md:w-12 md:h-12" />,
            title: "We didn't start as farmers...",
            subtitle: "We had stability, routines, and predictabilty. But something was missing.",
            bgTitle: "01 / The Disconnect",
            bgIcon: <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border border-stone-800 flex items-center justify-center bg-stone-900/50 backdrop-blur-xl shadow-2xl relative"><div className="absolute inset-0 bg-stone-500/20 rounded-full blur-xl" /><Leaf className="w-10 h-10 md:w-16 md:h-16 text-stone-500 relative z-10" /></div>,
            glow: "bg-stone-600/30",
            bgStyle: "bg-stone-950",
            accent: "text-stone-500"
        },
        {
            id: 1,
            icon: <Sprout className="text-emerald-400 mb-6 w-8 h-8 md:w-12 md:h-12" />,
            title: <>We started as <span className="text-emerald-400">weekend farmers.</span></>,
            subtitle: "Trading laptops for soil. Learning, failing, and trying again.",
            bgTitle: "02 / The Soil",
            bgIcon: <div className="w-40 h-40 md:w-64 md:h-64 rounded-full border border-emerald-900/50 flex items-center justify-center bg-emerald-950/50 backdrop-blur-xl shadow-[0_0_100px_rgba(16,185,129,0.1)] relative"><div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl" /><Sprout className="w-12 h-12 md:w-20 md:h-20 text-emerald-500 relative z-10" /></div>,
            glow: "bg-emerald-600/30",
            bgStyle: "bg-emerald-950",
            accent: "text-emerald-500"
        },
        {
            id: 2,
            icon: <Heart className="text-orange-400 mb-6 w-8 h-8 md:w-12 md:h-12" />,
            title: "From code and clinics to sunlight...",
            subtitle: "Every seed planted was a step away from routines, and closer to reality.",
            bgTitle: "03 / The Commitment",
            bgIcon: <div className="w-48 h-48 md:w-80 md:h-80 rounded-full border border-orange-900/50 flex items-center justify-center bg-orange-950/50 backdrop-blur-xl shadow-[0_0_150px_rgba(249,115,22,0.15)] relative"><div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl" /><Heart className="w-14 h-14 md:w-24 md:h-24 text-orange-500 relative z-10" /></div>,
            glow: "bg-orange-600/30",
            bgStyle: "bg-orange-950",
            accent: "text-orange-500"
        },
        {
            id: 3,
            icon: <Sparkles className="text-yellow-400 mb-6 w-8 h-8 md:w-12 md:h-12" />,
            title: <span className="flex flex-col gap-1 md:gap-2"><span>We found purpose</span><span className="text-yellow-400 italic">in growing life.</span></span>,
            subtitle: "Building something real that gives back to people.",
            bgTitle: "04 / The Harvest",
            bgIcon: <div className="w-56 h-56 md:w-96 md:h-96 rounded-full border border-yellow-900/50 flex items-center justify-center bg-yellow-950/50 backdrop-blur-xl shadow-[0_0_200px_rgba(234,179,8,0.2)] relative"><div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-3xl" /><Sparkles className="w-16 h-16 md:w-32 md:h-32 text-yellow-500 relative z-10" /></div>,
            glow: "bg-yellow-500/20",
            bgStyle: "bg-stone-900",
            accent: "text-yellow-500"
        }
    ];

    const current = steps[activeStep];

    return (
        <section ref={targetRef} className="h-[600vh] relative bg-stone-950 border-y border-stone-800">
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col md:flex-row">

                {/* Left Text Side (Top Foreground on Mobile) */}
                <div className="absolute top-0 left-0 w-full h-[50vh] md:relative md:w-1/2 md:h-full flex flex-col justify-center px-8 md:px-24 z-30 pointer-events-none md:pointer-events-auto">
                    <div className="relative w-full flex items-center justify-center md:justify-start lg:justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current.id}
                                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="flex flex-col justify-center w-full absolute pointer-events-auto items-center md:items-start"
                            >
                                <div className="hidden md:block">{current.icon}</div>
                                <h2 className="text-3xl md:text-5xl font-serif text-white font-medium leading-[1.2] drop-shadow-lg text-center md:text-left">
                                    {current.title}
                                </h2>
                                {current.subtitle && (
                                    <span className="text-base md:text-2xl text-white/70 mt-4 md:mt-6 block font-sans drop-shadow-md text-center md:text-left">
                                        {current.subtitle}
                                    </span>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Visual Side - Atmospheric Cinematic Container (Full Screen Background on Mobile) */}
                <div className="absolute inset-0 md:relative w-full md:w-1/2 h-full z-10 overflow-hidden bg-stone-950 md:bg-transparent">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={`bg-${current.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2 }}
                            className={`absolute inset-0 flex items-center justify-center transition-colors duration-1000 ${current.bgStyle} md:border-l border-white/5`}
                        >
                            {/* Glowing Aurora Background */}
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] ${current.glow} blur-[80px] md:blur-[120px] mix-blend-overlay animate-pulse opacity-60 pointer-events-none rounded-[100%]`} />

                            <div className="absolute bottom-0 left-0 w-full h-[50vh] md:relative md:w-full md:h-full z-10 flex flex-col items-center justify-center">
                                {/* Floating Object */}
                                <motion.div
                                    animate={{ y: [-10, 10, -10] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    {current.bgIcon}
                                </motion.div>

                                {/* Atmospheric Typography */}
                                <div className="mt-8 md:mt-16 text-center space-y-2 md:space-y-4 px-4 md:px-0">
                                    <span className={`text-xs md:text-sm font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase ${current.accent}`}>
                                        {current.bgTitle.split(' / ')[0]}
                                    </span>
                                    <h3 className="text-3xl md:text-6xl font-serif text-white opacity-90 drop-shadow-2xl">
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

// --- Gac Fruit Highlight Section ---
function GacFruitSection() {
    return (
        <section className="py-32 md:py-48 px-6 bg-stone-50 overflow-hidden relative flex flex-col items-center justify-center text-center">
            {/* Soft background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 max-w-4xl mx-auto space-y-8"
            >
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100 shadow-sm">
                    <span className="font-bold tracking-[0.2em] uppercase text-xs">The Turning Point</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-serif font-extrabold text-stone-900">
                    The Fruit That Changed Everything
                </h1>

                <p className="text-xl md:text-2xl text-stone-500 font-medium max-w-2xl mx-auto leading-relaxed">
                    A rare discovery packed with powerful nutrients. We realized this was an opportunity to bring something incredibly valuable into people's lives.
                </p>

                {/* Glowing Abstract Fruit Representation */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="mt-16 relative w-48 h-48 md:w-64 md:h-64 mx-auto"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-600 to-red-500 rounded-full animate-pulse blur-2xl opacity-40 mix-blend-multiply" />
                    <div className="absolute inset-4 bg-gradient-to-tr from-orange-500 to-red-400 rounded-full shadow-[0_0_80px_rgba(249,115,22,0.4)] flex items-center justify-center">
                        <span className="text-6xl md:text-8xl mix-blend-overlay opacity-80">🍊</span>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}

// --- Mission Floating Section ---
function MissionSection() {
    return (
        <section className="py-40 px-6 bg-white overflow-hidden flex items-center justify-center">
            <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="max-w-5xl mx-auto text-center"
            >
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif text-primary/80 font-medium leading-[1.3]">
                    "To bring rare, powerful, and health-rich fruits to people."
                </h2>
            </motion.div>
        </section>
    );
}

// --- Emotional Closing & CTA ---
function ClosingSection() {
    return (
        <section className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-stone-950 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-stone-950 to-stone-950" />

            <div className="relative z-10 max-w-4xl mx-auto space-y-16">
                <div className="space-y-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="text-4xl md:text-6xl font-serif font-medium text-white/90"
                    >
                        We didn't start as farmers.
                    </motion.h2>
                    <motion.h2
                        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
                        className="text-5xl md:text-7xl font-serif font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        We started with a belief.
                    </motion.h2>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.4, duration: 1, ease: "easeOut" }}
                >
                    <Link href="/products" className="group inline-flex items-center gap-3 bg-white px-8 py-5 rounded-full text-stone-950 font-bold text-lg transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]">
                        Explore Talari Farms
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

export default function AboutPage() {
    return (
        <div className="bg-surface">
            <HeroSection />
            <FoundersSection />
            <StorySection />
            <GacFruitSection />
            <MissionSection />
            <ClosingSection />
        </div>
    );
}
