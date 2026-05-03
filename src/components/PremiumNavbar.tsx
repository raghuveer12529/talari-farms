'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Products', href: '#products' },
    { name: 'Why Us', href: '#why-us' },
    { name: 'Contact', href: '#contact' },
];

export default function PremiumNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    /* Scroll detection */
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    /* Active-section detection via IntersectionObserver */
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -70% 0px' }
        );

        const sections = document.querySelectorAll('section[id]');
        sections.forEach((s) => observer.observe(s));
        return () => sections.forEach((s) => observer.unobserve(s));
    }, []);

    /* Lock body scroll when mobile menu is open */
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 pt-4 px-4 sm:px-6">
            {/* Pill wrapper */}
            <div
                className={`container-px mx-auto max-w-7xl flex items-center justify-between rounded-full px-5 py-3 transition-all duration-500 ${
                    isScrolled ? 'glass shadow-soft' : 'bg-transparent'
                }`}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="rounded-2xl bg-background/60 backdrop-blur-sm p-1.5 shadow-soft group-hover:scale-105 transition-transform overflow-hidden w-10 h-10 relative">
                        <Image
                            src="/logo-lovable.png"
                            alt="Talari Farms Logo"
                            fill
                            className="object-cover"
                            sizes="40px"
                            priority
                        />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-xl font-bold tracking-[0.08em] text-[hsl(120_45%_28%)] leading-tight">
                            TALARI FARMS
                        </span>
                        <span className="text-[10px] font-semibold tracking-[0.35em] mt-0.5 text-[hsl(120_45%_35%)] uppercase">
                            PURELY NATURAL
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = activeSection === link.href.substring(1);
                        return (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                                    isActive
                                        ? 'text-primary bg-primary/5'
                                        : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
                                }`}
                            >
                                {link.name}
                            </a>
                        );
                    })}
                    <a
                        href="#contact"
                        className="ml-3 bg-gradient-hero text-white rounded-full px-6 py-2.5 text-sm font-semibold shadow-elegant hover:shadow-glow hover:scale-105 transition-all"
                    >
                        Get Quote
                    </a>
                </nav>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-background/70 backdrop-blur-sm text-foreground shadow-soft"
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xl md:hidden flex flex-col p-6">
                    {/* Close row */}
                    <div className="flex justify-between items-center mb-10">
                        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                            <div className="rounded-2xl bg-background/60 p-1.5 overflow-hidden w-10 h-10 relative shadow-soft">
                                <Image src="/logo-lovable.png" alt="Talari Farms Logo" fill className="object-cover" sizes="40px" />
                            </div>
                            <span className="text-xl font-bold tracking-[0.08em] text-[hsl(120_45%_28%)]">TALARI FARMS</span>
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-foreground"
                            aria-label="Close menu"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Nav panel */}
                    <div className="glass rounded-3xl p-6 mt-3 flex flex-col gap-3">
                        {navLinks.map((link) => {
                            const isActive = activeSection === link.href.substring(1);
                            return (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`text-2xl font-bold py-3 px-4 rounded-2xl transition-colors ${
                                        isActive ? 'text-primary bg-primary/5' : 'text-foreground hover:text-primary hover:bg-primary/5'
                                    }`}
                                >
                                    {link.name}
                                </a>
                            );
                        })}
                        <a
                            href="#contact"
                            onClick={() => setMobileMenuOpen(false)}
                            className="mt-3 bg-gradient-hero text-white rounded-full px-6 py-4 text-lg font-bold text-center shadow-elegant"
                        >
                            Get Quote
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
