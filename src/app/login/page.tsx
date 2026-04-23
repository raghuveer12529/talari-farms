'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password. Please try again.');
            } else {
                router.refresh();

                // Fetch the session to determine the user's role for proper routing
                const sessionRes = await fetch('/api/auth/session');
                const session = await sessionRes.json();

                const role = session?.user?.role;

                // Check if we have a specific return URL (e.g. from checkout)
                const callbackUrl = new URL(window.location.href).searchParams.get('callbackUrl');

                if (callbackUrl) {
                    router.push(callbackUrl);
                } else if (role === 'ADMIN' || role === 'PARTNER') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-surface">
            {/* Desktop Image Section (Left Side) */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-primary/5">
                <Image
                    src="/hero-gac.png"
                    alt="Talari Farms natural Field"
                    fill
                    className="object-cover scale-105 hover:scale-100 transition-transform duration-[20s]"
                    priority
                />

                {/* Elegant Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/20 to-transparent" />
                <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px]" />

                {/* Optional Quote/Text Overlay */}
                <div className="absolute bottom-16 left-16 right-16 text-white space-y-4 animate-in fade-in slide-in-from-bottom-8 delay-300 duration-1000">
                    <div className="w-12 h-1 bg-secondary/80 rounded-full mb-6" />
                    <blockquote className="text-3xl font-serif leading-tight">
                        "From our soil to your soul. Experience the purest harvest nature has to offer."
                    </blockquote>
                    <p className="text-white/80 font-medium tracking-wide text-sm pt-2">
                        — The Talari Promise
                    </p>
                </div>
            </div>



            {/* Form Section (Right on Desktop) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-surface/50 relative overflow-hidden">
                {/* Mobile Background Image (Only visible when lg:hidden) */}
                <div className="lg:hidden absolute inset-0 z-0">
                    <Image
                        src="/hero-gac.png"
                        alt="Mobile Background"
                        fill
                        className="object-cover opacity-[0.15]"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
                </div>

                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">

                    {/* Brand Header */}
                    <div className="text-center space-y-6">
                        <Link href="/" className="inline-block transition-transform hover:scale-105 duration-300">
                            <div className="relative w-24 h-24 mx-auto overflow-hidden rounded-full shadow-2xl shadow-primary/20 border-4 border-white">
                                <Image
                                    src="/logo.jpg"
                                    alt="Talari Farms"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </Link>

                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-serif font-medium text-primary tracking-tight">
                                Welcome Back
                            </h1>
                            <p className="text-primary/60 text-sm md:text-base font-light">
                                Sign in to access your premium harvest.
                            </p>
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/5 space-y-6 relative overflow-hidden group/card">

                        {/* Subtle interactive gradient blob */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                        {error && (
                            <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in zoom-in-95">
                                <span className="text-red-500 mt-0.5">•</span>
                                <p className="text-red-600 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-secondary transition-colors duration-300">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        required
                                        type="email"
                                        className="w-full pl-12 pr-4 py-4 bg-surface/50 border border-primary/10 rounded-2xl focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary/50 outline-none transition-all duration-300 font-medium text-primary placeholder:text-primary/20"
                                        placeholder="jane@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-primary/40 uppercase tracking-widest">
                                        Password
                                    </label>
                                    <Link href="#" className="text-xs font-bold text-secondary hover:text-secondary/80 transition-colors uppercase tracking-wider">
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-secondary transition-colors duration-300">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        required
                                        type="password"
                                        className="w-full pl-12 pr-4 py-4 bg-surface/50 border border-primary/10 rounded-2xl focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary/50 outline-none transition-all duration-300 font-medium text-primary placeholder:text-primary/20"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-medium shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>Sign In <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>

                        <div className="pt-2 text-center">
                            <p className="text-sm text-primary/50">
                                Don't have an account? {' '}
                                <Link href="/register" className="font-bold text-primary hover:text-secondary transition-colors duration-300">
                                    Join the Family
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Trust Signals */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-center gap-2 text-primary/40">
                            <span className="h-px w-12 bg-primary/10" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Nature's Promise</span>
                            <span className="h-px w-12 bg-primary/10" />
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                            {['Farm-Direct', '100% natural', 'Premium Quality'].map((text) => (
                                <div key={text} className="flex items-center gap-1.5 text-primary/60">
                                    <CheckCircle2 size={13} className="text-secondary" />
                                    <span className="text-xs font-medium tracking-wide">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
