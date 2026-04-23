'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function ContactHero() {
    return (
        <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-stone-50">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-100/40 via-stone-50 to-stone-50 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 text-center max-w-3xl mx-auto space-y-6"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 text-orange-600 shadow-sm mx-auto">
                    <span className="font-bold tracking-[0.2em] uppercase text-xs">Contact Us</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-serif font-extrabold text-stone-900 tracking-tight leading-tight">
                    Let's Keep in Touch
                </h1>
                <p className="text-lg md:text-xl text-stone-500 font-medium leading-relaxed">
                    Whether you have questions about our Gac fruit, partnership opportunities, or just want to say hello—we'd love to hear from you.
                </p>
            </motion.div>
        </section>
    );
}

function ContactDetails() {
    const methods = [
        {
            icon: <Phone className="w-8 h-8 text-emerald-600" />,
            title: "Phone",
            desc: "Mon-Sat from 8am to 5pm.",
            value: "+91 98765 43210",
            bg: "bg-emerald-50 border-emerald-100",
            border: "group-hover:border-emerald-300"
        },
        {
            icon: <Mail className="w-8 h-8 text-orange-600" />,
            title: "Email",
            desc: "Our friendly team is here to help.",
            value: "hello@talarifarms.com",
            bg: "bg-orange-50 border-orange-100",
            border: "group-hover:border-orange-300"
        },
        {
            icon: <MapPin className="w-8 h-8 text-blue-600" />,
            title: "Farm Location",
            desc: "Come visit our natural Gac estate.",
            value: "Andhra Pradesh, India",
            bg: "bg-blue-50 border-blue-100",
            border: "group-hover:border-blue-300"
        }
    ];

    return (
        <section className="py-20 px-6 bg-stone-50 relative z-10">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {methods.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="group bg-white p-10 rounded-[2rem] border border-stone-200 shadow-xl shadow-stone-200/40 hover:-translate-y-2 transition-transform duration-300 flex flex-col items-start"
                    >
                        <div className={`w-16 h-16 flex items-center justify-center rounded-2xl ${item.bg} border ${item.border} transition-colors mb-6`}>
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 mb-2">{item.title}</h3>
                        <p className="text-stone-500 mb-8 flex-grow">{item.desc}</p>
                        <span className="text-lg font-bold text-stone-900">{item.value}</span>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function ContactForm() {
    return (
        <section className="py-24 px-6 bg-white border-t border-stone-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-orange-50/50 via-white to-white pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

                {/* Text Side */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="w-full lg:w-1/2 space-y-6"
                >
                    <h2 className="text-4xl lg:text-6xl font-serif font-extrabold text-stone-900 leading-tight">
                        Send us a message
                    </h2>
                    <p className="text-xl text-stone-500 leading-relaxed">
                        Interested in stocking Talari Farms produce? Curious about our farming methods? Drop a line below and one of our founders will get back to you personally.
                    </p>
                </motion.div>

                {/* Form Side */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="w-full lg:w-1/2 bg-stone-50 p-8 md:p-12 rounded-[2.5rem] border border-stone-200 shadow-2xl shadow-stone-200/50 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                        <Send className="w-64 h-64 text-orange-900" />
                    </div>

                    <form className="relative z-10 flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-stone-800 ml-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="Raghuveer Talari"
                                className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-stone-900 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-stone-800 ml-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="hello@example.com"
                                className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-stone-900 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-stone-800 ml-1">Message</label>
                            <textarea
                                rows={4}
                                placeholder="How can we help you?"
                                className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-stone-900 outline-none resize-none"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="mt-4 flex items-center justify-center gap-3 bg-stone-900 hover:bg-orange-600 text-white font-bold py-5 rounded-2xl transition-colors duration-300 shadow-lg shadow-stone-900/10 group/btn"
                        >
                            Send Inquiry
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
}

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-stone-50 font-sans selection:bg-orange-200">
            <ContactHero />
            <ContactDetails />
            <ContactForm />
        </div>
    );
}
