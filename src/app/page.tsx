'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Leaf,
    Zap,
    ShieldCheck,
    Mail,
    Phone,
    MapPin,
    Sparkles,
    Eye,
    HeartPulse,
    Quote,
} from 'lucide-react';
import PremiumNavbar from '@/components/PremiumNavbar';
import GacProductCard from '@/components/GacProductCard';
import SectionHeading from '@/components/SectionHeading';
import { submitContactForm, type ContactFormState } from '@/actions/contact';

/* ─────────────────────────────────────────────
   Scroll-reveal hook
───────────────────────────────────────────── */
function useReveal() {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.12 }
        );

        const elements = document.querySelectorAll('.reveal');
        elements.forEach((el) => observer.observe(el));
        return () => elements.forEach((el) => observer.unobserve(el));
    }, []);
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero() {
    return (
        <section id="home" className="relative overflow-hidden">
            {/* Warm gradient background */}
            <div className="absolute inset-0 bg-gradient-warm" />

            {/* Glow blobs */}
            <div className="pointer-events-none absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl" />

            <div className="container-px mx-auto max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center pt-32 pb-20 md:pt-40 md:pb-28">

                    {/* ── Left ── */}
                    <div className="flex flex-col">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 shadow-soft mb-8 self-start"
                        >
                            <Sparkles size={13} className="text-primary" />
                            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-foreground">
                                Premium Indian Superfruit
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 28 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.1 }}
                            className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6"
                        >
                            India&apos;s Premium Source of{' '}
                            <span className="gradient-text">Nutrient-Rich Gac Fruit</span>
                        </motion.h1>

                        {/* Subtext */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.9, delay: 0.3 }}
                            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mb-10"
                        >
                            Fresh Gac Fruit, Cold-Pressed Juice, and High-Quality Powder for Nutraceutical &amp; Food Industries — farm-grown, lab-tested, export-ready.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.45 }}
                            className="flex flex-wrap gap-4"
                        >
                            <a
                                href="#contact"
                                className="bg-gradient-hero text-white rounded-full px-8 h-14 font-semibold shadow-elegant hover:shadow-glow hover:scale-105 transition-all flex items-center gap-2"
                            >
                                Get Quote <ArrowRight size={18} />
                            </a>
                            <a
                                href="#products"
                                className="border-2 border-primary/20 bg-background/60 backdrop-blur-sm text-foreground hover:bg-primary/5 hover:border-primary/40 rounded-full px-8 h-14 font-semibold transition-all flex items-center"
                            >
                                Explore Products
                            </a>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.65, duration: 0.9 }}
                            className="grid grid-cols-3 gap-6 pt-6 mt-10 border-t border-border/60 max-w-lg"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="gradient-text font-display text-2xl md:text-3xl font-bold">70x</span>
                                <span className="text-[11px] text-muted-foreground font-medium leading-snug">More Lycopene than Tomato</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="gradient-text font-display text-2xl md:text-3xl font-bold">100%</span>
                                <span className="text-[11px] text-muted-foreground font-medium leading-snug">Chemical-Free Cultivation</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="gradient-text font-display text-2xl md:text-3xl font-bold">Global</span>
                                <span className="text-[11px] text-muted-foreground font-medium leading-snug">Bulk Export Available</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Right ── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative aspect-[4/5] lg:h-[650px] lg:aspect-auto"
                    >
                        <div className="rounded-[2.5rem] overflow-hidden shadow-elegant w-full h-full relative">
                            <Image
                                src="/hero-gac-lovable.jpg"
                                alt="Fresh Gac Fruit"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />
                        </div>

                        {/* Floating badge 1 */}
                        <div className="absolute -left-4 md:-left-8 top-12 glass-card rounded-2xl px-5 py-4 shadow-card-premium hidden sm:flex flex-col animate-float">
                            <span className="text-[10px] font-semibold text-muted-foreground mb-0.5">Beta-Carotene</span>
                            <span className="font-display font-bold text-lg gradient-text">10x Carrots</span>
                        </div>

                        {/* Floating badge 2 */}
                        <div className="absolute -right-2 md:-right-6 bottom-16 glass-card rounded-2xl px-5 py-4 shadow-card-premium hidden sm:flex flex-col animate-float-delayed">
                            <span className="text-[10px] font-semibold text-muted-foreground mb-0.5">Lab Tested</span>
                            <span className="font-display font-bold text-lg gradient-text">Certified Pure</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   ABOUT / STORY
───────────────────────────────────────────── */
function Story() {
    return (
        <section id="about" className="section-padding relative">
            <div className="container-px mx-auto max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

                    {/* Image — order 2 on mobile, 1 on desktop */}
                    <div className="reveal relative order-2 lg:order-1">
                        <div className="rounded-[2rem] overflow-hidden shadow-elegant relative aspect-[4/5]">
                            <Image
                                src="/farm.jpg"
                                alt="Talari Farms — Gac cultivation"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                        {/* Floating stat */}
                        <div className="absolute -bottom-6 -right-6 glass-card rounded-2xl p-6 hidden md:block">
                            <span className="text-3xl font-display font-bold gradient-text">100+</span>
                            <p className="text-sm text-muted-foreground mt-1">Partner Farmers</p>
                        </div>
                    </div>

                    {/* Text — order 1 on mobile, 2 on desktop */}
                    <div className="reveal order-1 lg:order-2">
                        <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4">
                            OUR STORY
                        </span>
                        <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-6">
                            Cultivating a rare superfruit with{' '}
                            <span className="gradient-text">uncompromising care</span>
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Talari Farms began with a simple belief — that India&apos;s climate and soil could nurture one of the world&apos;s most nutrient-dense fruits. Today, we partner with farmers across the region to grow Gac fruit at scale, with absolute integrity, from seed to shipment.
                        </p>

                        {/* Feature card 1 */}
                        <div className="flex gap-4 glass-card rounded-2xl p-5 mt-8">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-hero shadow-soft">
                                <Leaf size={20} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground text-base mb-1">Natural Cultivation</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Pesticide-free farming honoring soil, water, and seasonal rhythms.
                                </p>
                            </div>
                        </div>

                        {/* Feature card 2 */}
                        <div className="flex gap-4 glass-card rounded-2xl p-5 mt-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-hero shadow-soft">
                                <ShieldCheck size={20} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground text-base mb-1">Quality Control</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Every batch graded, sorted, and verified before it ever leaves the farm.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   PRODUCTS
───────────────────────────────────────────── */
function ProductShowcase() {
    return (
        <section id="products" className="section-padding relative bg-gradient-warm">
            {/* Glow overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-glow opacity-50" />

            <div className="container-px mx-auto max-w-7xl relative z-10">
                {/* Heading */}
                <div className="reveal text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4">
                        OUR PRODUCTS
                    </span>
                    <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
                        Farm to <span className="gradient-text">Formulation</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mt-5">
                        Whole, pressed, or powdered — every product carries the integrity of farm-to-export craftsmanship.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-2 gap-7 reveal">
                    <GacProductCard
                        category="EXPORTERS & PROCESSORS"
                        title="Gac Fruit"
                        badge="Fresh • Organic • Bulk"
                        description="Hand-harvested at peak ripeness, our whole Gac fruit is ideal for exporters, processors, and premium retail."
                        features={[
                            'Farm-fresh, chemical-free',
                            'Bulk supply year-round',
                            'Cold-chain export ready',
                        ]}
                        image="/product-fruit.jpg"
                    />
                    <GacProductCard
                        category="BEVERAGE BRANDS"
                        title="Gac Fruit Juice"
                        badge="Cold-Pressed • Pure"
                        description="Slow cold-pressed to preserve every drop of antioxidant power. Ready for premium beverage formulations."
                        features={[
                            'Rich in lycopene & beta-carotene',
                            'Zero additives or preservatives',
                            'Private-label ready',
                        ]}
                        image="/product-juice.jpg"
                    />
                    <GacProductCard
                        category="NUTRACEUTICALS & SUPPLEMENTS"
                        title="Gac Fruit Powder"
                        badge="Dehydrated • Concentrated"
                        description="Low-temperature dehydration retains maximum nutrient density. Engineered for nutraceuticals and supplements."
                        features={[
                            'High nutrient retention',
                            'Long shelf life',
                            'Custom mesh sizing',
                        ]}
                        image="/product-powder.jpg"
                    />
                    <GacProductCard
                        category="COSMETICS & WELLNESS"
                        title="Gac Fruit Oil"
                        badge="Cold-Extracted • Pure"
                        description="Cold-extracted from Gac seeds, our oil is one of nature's richest sources of tocotrienols and carotenoids — ideal for premium cosmetics and wellness formulations."
                        features={[
                            'Highest natural beta-carotene content',
                            'Cold-extracted, no solvents',
                            'Cosmetic & food grade available',
                        ]}
                        image="/product-oil.jpg"
                    />
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   WHY GAC
───────────────────────────────────────────── */
function WhyGac() {
    return (
        <section id="why-us" className="section-padding relative">
            <div className="container-px mx-auto max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Left */}
                    <div className="reveal flex-1 space-y-6">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">DID YOU KNOW?</span>
                        <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
                            What is <span className="gradient-text">Gac Fruit?</span>
                        </h2>
                        <div className="space-y-5 text-muted-foreground text-lg leading-relaxed pt-2">
                            <p>
                                Often called the &quot;Fruit from Heaven,&quot; Gac (<em>Momordica cochinchinensis</em>) is a Southeast Asian superfruit revered for its extraordinary concentration of carotenoids — including up to{' '}
                                <strong className="text-foreground">70x the lycopene of tomatoes</strong> and{' '}
                                <strong className="text-foreground">10x the beta-carotene of carrots</strong>.
                            </p>
                            <p>
                                Once a rare delicacy, it&apos;s now a global ingredient driving innovation in nutraceuticals, premium beverages, and functional foods.
                            </p>
                        </div>
                    </div>

                    {/* Right — benefit cards */}
                    <div className="reveal flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Heart Health */}
                        <div className="glass-card rounded-3xl p-8">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-hero shadow-soft mb-3">
                                <HeartPulse size={20} className="text-white" />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-2">
                                HEART HEALTH
                            </span>
                            <h4 className="font-bold text-foreground text-lg">Rich in antioxidants</h4>
                        </div>

                        {/* Vision */}
                        <div className="glass-card rounded-3xl p-8">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-hero shadow-soft mb-3">
                                <Eye size={20} className="text-white" />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-2">
                                VISION
                            </span>
                            <h4 className="font-bold text-foreground text-lg">Beta-carotene boost</h4>
                        </div>

                        {/* Immunity */}
                        <div className="glass-card rounded-3xl p-8">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-hero shadow-soft mb-3">
                                <ShieldCheck size={20} className="text-white" />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-2">
                                IMMUNITY
                            </span>
                            <h4 className="font-bold text-foreground text-lg">Vitamin C &amp; E dense</h4>
                        </div>

                        {/* Energy */}
                        <div className="glass-card rounded-3xl p-8">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-hero shadow-soft mb-3">
                                <Zap size={20} className="text-white" />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-2">
                                ENERGY
                            </span>
                            <h4 className="font-bold text-foreground text-lg">Bioactive compounds</h4>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────── */
const testimonials = [
    {
        quote: "Talari's cold-pressed Gac juice raised the bar for our entire wellness line. Consistent quality, reliable supply.",
        name: 'Priya M.',
        role: 'Co-founder, NutriVerde India',
    },
    {
        quote: "Working directly with the farm gives us total traceability. Their powder is the cleanest we've sourced globally.",
        name: 'Dr. Arvind R.',
        role: 'Head of R&D, BioPure Nutraceuticals',
    },
    {
        quote: "Export-ready packaging, lab certificates, and on-time deliveries — exactly what serious B2B partners need.",
        name: 'Siddharth N.',
        role: 'Senior Procurement, GreenLeaf Foods',
    },
];

function Testimonials() {
    return (
        <section id="testimonials" className="section-padding relative bg-gradient-warm">
            <div className="container-px mx-auto max-w-7xl">
                {/* Heading */}
                <div className="reveal text-center max-w-2xl mx-auto">
                    <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4">
                        CLIENT FEEDBACK
                    </span>
                    <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
                        Trusted by <span className="gradient-text">growing brands</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mt-5">
                        From beverage startups to global nutraceutical labs — here&apos;s what our partners say.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-8 text-left mt-16 reveal">
                    {testimonials.map((t) => (
                        <div key={t.name} className="glass-card p-10 rounded-3xl flex flex-col gap-6">
                            <Quote className="text-primary/30 w-10 h-10 rotate-180" />
                            <p className="text-foreground text-lg leading-relaxed flex-1">&quot;{t.quote}&quot;</p>
                            <div className="flex gap-0.5 text-primary text-xl">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i}>★</span>
                                ))}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-foreground">{t.name}</div>
                                <div className="text-xs text-muted-foreground font-medium mt-0.5">{t.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   CONTACT
───────────────────────────────────────────── */
const INPUT_CLASS =
    'w-full bg-input border border-border/40 rounded-[1rem] px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all';

function Contact() {
    const initialState: ContactFormState = { status: 'idle' };
    const [formState, setFormState] = useState<ContactFormState>(initialState);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        const data = new FormData(e.currentTarget);
        const result = await submitContactForm(formState, data);
        setFormState(result);
        setSubmitting(false);
    };

    return (
        <section id="contact" className="section-padding relative">
            <div className="container-px mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 lg:gap-24">

                {/* Left */}
                <div className="reveal space-y-8">
                    <div>
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4 block">
                            GET IN TOUCH
                        </span>
                        <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
                            Request a{' '}
                            <span className="gradient-text">custom quote</span>
                        </h2>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Tell us your requirements — we&apos;ll respond within 24 hours.
                    </p>

                    <div className="space-y-5 pt-2">
                        {/* Email */}
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-soft border border-border/40">
                                <Mail className="text-primary" size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Email Inquiry</p>
                                <p className="text-base font-bold text-foreground">raghu.veer12529@gmail.com</p>
                            </div>
                        </div>
                        {/* Phone */}
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-soft border border-border/40">
                                <Phone className="text-primary" size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">WhatsApp / Call</p>
                                <p className="text-base font-bold text-foreground">+91 92996 59344</p>
                                <p className="text-base font-bold text-foreground">+91 96033 69074</p>
                            </div>
                        </div>
                        {/* Location */}
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-soft border border-border/40">
                                <MapPin className="text-primary" size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Origin Farm</p>
                                <p className="text-base font-bold text-foreground">Bukkapur, Telangana, India</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — form */}
                <div className="reveal">
                    <div className="glass-card p-10 rounded-[2.5rem]">
                        {formState.status === 'success' ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ShieldCheck size={32} className="text-primary" />
                                </div>
                                <h3 className="font-display text-2xl font-bold text-foreground">Inquiry Received!</h3>
                                <p className="text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
                                <button
                                    onClick={() => setFormState(initialState)}
                                    className="mt-2 text-sm font-bold text-primary underline underline-offset-4"
                                >
                                    Send another inquiry
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Name + Company */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-bold text-foreground">Full Name *</label>
                                        <input id="name" name="name" required type="text" placeholder="Your name" className={INPUT_CLASS} />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="company" className="text-sm font-bold text-foreground">Company</label>
                                        <input id="company" name="company" type="text" placeholder="Company name" className={INPUT_CLASS} />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-bold text-foreground">Email *</label>
                                    <input id="email" name="email" required type="email" placeholder="you@company.com" className={INPUT_CLASS} />
                                </div>

                                {/* Requirement (select) */}
                                <div className="space-y-2">
                                    <label htmlFor="requirement" className="text-sm font-bold text-foreground">Product Requirement *</label>
                                    <select id="requirement" name="requirement" required className={INPUT_CLASS}>
                                        <option value="" disabled>Select a product…</option>
                                        <option value="Gac Fruit (Fresh / Whole)">Gac Fruit (Fresh / Whole)</option>
                                        <option value="Gac Fruit Juice (Cold-Pressed)">Gac Fruit Juice (Cold-Pressed)</option>
                                        <option value="Gac Fruit Powder">Gac Fruit Powder</option>
                                        <option value="Gac Fruit Oil (Cold-Extracted)">Gac Fruit Oil (Cold-Extracted)</option>
                                        <option value="Multiple / Mixed Products">Multiple / Mixed Products</option>
                                    </select>
                                </div>

                                {/* Quantity */}
                                <div className="space-y-2">
                                    <label htmlFor="quantity" className="text-sm font-bold text-foreground">Quantity Required *</label>
                                    <input
                                        id="quantity"
                                        name="quantity"
                                        required
                                        type="text"
                                        placeholder="e.g. 100 kg, 5 MT"
                                        className={INPUT_CLASS}
                                    />
                                </div>

                                {/* Message (optional) */}
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-bold text-foreground">
                                        Additional Message <span className="text-muted-foreground font-normal">(optional)</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={3}
                                        placeholder="Destination country, packaging preferences, etc."
                                        className={`${INPUT_CLASS} resize-none`}
                                    />
                                </div>

                                {/* Error */}
                                {formState.status === 'error' && (
                                    <p className="text-sm font-semibold text-red-600">{formState.error}</p>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-gradient-hero text-white w-full py-4 rounded-[1rem] font-bold text-lg mt-2 transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Sending…' : 'Request Quote'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
    return (
        <footer className="py-16 px-6 bg-foreground text-background font-sans">
            <div className="mx-auto max-w-7xl flex flex-col md:flex-row gap-10 md:gap-16 items-start md:items-center justify-between">

                {/* Brand */}
                <div className="flex flex-col gap-4 max-w-sm">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden bg-background/10 backdrop-blur-sm p-1 relative">
                            <Image src="/logo-lovable.png" alt="Talari Farms Logo" fill className="object-cover rounded-xl" sizes="40px" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-xl font-bold tracking-[0.08em] text-background leading-tight">TALARI FARMS</span>
                            <span className="text-[10px] font-semibold tracking-[0.35em] mt-0.5 text-background/60 uppercase">PURELY NATURAL</span>
                        </div>
                    </Link>
                    <p className="text-sm text-background/60 leading-relaxed">
                        India&apos;s premium grower and supplier of Gac Fruit, Cold-Pressed Juice, and Powder for nutraceutical, beverage, and food industries worldwide.
                    </p>
                </div>

                {/* Nav */}
                <nav className="flex flex-wrap gap-x-8 gap-y-3">
                    {[
                        { label: 'About', href: '#about' },
                        { label: 'Products', href: '#products' },
                        { label: 'Why Us', href: '#why-us' },
                        { label: 'Contact', href: '#contact' },
                    ].map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-sm font-semibold text-background/60 hover:text-background transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* Copyright */}
                <p className="text-xs text-background/40 whitespace-nowrap">
                    &copy; {new Date().getFullYear()} Talari Farms India.<br className="md:hidden" /> All rights reserved.
                </p>
            </div>
        </footer>
    );
}

/* ─────────────────────────────────────────────
   JSON-LD Structured Data
───────────────────────────────────────────── */
const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'LocalBusiness',
            '@id': 'https://www.talarifarms.co.in/#business',
            name: 'Talari Farms',
            description:
                "India's leading Gac fruit (Momordica cochinchinensis) supplier based in Bukkapur, Telangana. We export fresh Gac fruit, cold-pressed juice & powder in bulk.",
            url: 'https://www.talarifarms.co.in',
            logo: 'https://www.talarifarms.co.in/logo-lovable.png',
            image: 'https://www.talarifarms.co.in/hero-gac-lovable.jpg',
            telephone: ['+919299659344', '+919603369074'],
            email: 'raghu.veer12529@gmail.com',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Bukkapur',
                addressRegion: 'Telangana',
                addressCountry: 'IN',
            },
            geo: {
                '@type': 'GeoCoordinates',
                latitude: 17.385,
                longitude: 78.4867,
            },
            areaServed: 'Worldwide',
            priceRange: '$$',
            sameAs: [],
        },
        {
            '@type': 'Product',
            name: 'Fresh Gac Fruit (Whole)',
            description:
                'Premium whole Gac fruit (Momordica cochinchinensis) sourced from natural farms in Telangana, India. Available for bulk export.',
            brand: { '@type': 'Brand', name: 'Talari Farms' },
            image: 'https://www.talarifarms.co.in/product-fruit.jpg',
            offers: {
                '@type': 'Offer',
                availability: 'https://schema.org/InStock',
                priceCurrency: 'INR',
                seller: { '@type': 'Organization', name: 'Talari Farms' },
            },
        },
        {
            '@type': 'Product',
            name: 'Gac Fruit Cold-Pressed Juice',
            description:
                'Cold-pressed Gac fruit juice rich in lycopene and beta-carotene. Bulk supply available for beverage and nutraceutical brands.',
            brand: { '@type': 'Brand', name: 'Talari Farms' },
            image: 'https://www.talarifarms.co.in/product-juice.jpg',
            offers: {
                '@type': 'Offer',
                availability: 'https://schema.org/InStock',
                priceCurrency: 'INR',
                seller: { '@type': 'Organization', name: 'Talari Farms' },
            },
        },
        {
            '@type': 'Product',
            name: 'Gac Fruit Powder',
            description:
                'Spray-dried Gac fruit powder with concentrated carotenoids. Ideal for supplements, functional foods and cosmetics. Export-ready.',
            brand: { '@type': 'Brand', name: 'Talari Farms' },
            image: 'https://www.talarifarms.co.in/product-powder.jpg',
            offers: {
                '@type': 'Offer',
                availability: 'https://schema.org/InStock',
                priceCurrency: 'INR',
                seller: { '@type': 'Organization', name: 'Talari Farms' },
            },
        },
        {
            '@type': 'Product',
            name: 'Gac Fruit Oil',
            description:
                'Cold-extracted Gac seed oil — one of nature\'s richest sources of tocotrienols and carotenoids. Available in cosmetic and food grade for premium wellness formulations.',
            brand: { '@type': 'Brand', name: 'Talari Farms' },
            image: 'https://www.talarifarms.co.in/product-oil.jpg',
            offers: {
                '@type': 'Offer',
                availability: 'https://schema.org/InStock',
                priceCurrency: 'INR',
                seller: { '@type': 'Organization', name: 'Talari Farms' },
            },
        },
    ],
};

/* ─────────────────────────────────────────────
   ROOT PAGE
───────────────────────────────────────────── */
export default function HomePage() {
    useReveal();

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="min-h-screen overflow-x-hidden selection:bg-primary/20 selection:text-primary">
                <PremiumNavbar />
                <Hero />
                <Story />
                <ProductShowcase />
                <WhyGac />
                <Testimonials />
                <Contact />
                <Footer />
            </main>
        </>
    );
}
