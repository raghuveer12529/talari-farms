'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { registerUser } from '@/lib/actions/auth';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match. Please try again.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);

        const result = await registerUser(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setSuccess('Account created successfully! Welcome to the farm.');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6 py-32">
            <div className="w-full max-w-md space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <header className="text-center space-y-4">
                    <div className="inline-flex w-12 h-12 bg-primary text-white items-center justify-center rounded-xl text-lg font-bold shadow-xl shadow-primary/10 transition-transform hover:scale-105 duration-300">TF</div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Join the Harvest</h1>
                    <p className="text-sm font-medium text-primary/40">Enter your details to create your farm-to-home account.</p>
                </header>

                <div className="bg-surface p-10 rounded-[2.5rem] border border-primary/5 shadow-2xl shadow-primary/5 space-y-8">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-bold uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-[10px] font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                            <CheckCircle2 size={14} /> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                <User size={12} /> Full Name
                            </label>
                            <input
                                required
                                type="text"
                                className="w-full p-4 bg-white border border-primary/5 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-primary placeholder:text-primary/20"
                                placeholder="Jane Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                <Mail size={12} /> Email Address
                            </label>
                            <input
                                required
                                type="email"
                                className="w-full p-4 bg-white border border-primary/5 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-primary placeholder:text-primary/20"
                                placeholder="jane@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                <Lock size={12} /> Password
                            </label>
                            <input
                                required
                                type="password"
                                className="w-full p-4 bg-white border border-primary/5 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-primary placeholder:text-primary/20"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                <Lock size={12} /> Confirm Password
                            </label>
                            <input
                                required
                                type="password"
                                className="w-full p-4 bg-white border border-primary/5 rounded-2xl focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-primary placeholder:text-primary/20"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !!success}
                            className="btn-apple btn-apple-primary w-full py-4 text-base shadow-xl shadow-primary/10 flex items-center justify-center gap-2 disabled:opacity-50 group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-primary/5 text-center">
                        <p className="text-sm font-medium text-primary/40">
                            Already part of our community? {' '}
                            <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4 decoration-2 decoration-secondary/30 transition-all">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-[10px] text-primary/20 text-center uppercase tracking-widest font-bold">
                    Join 10,000+ Freshness Enthusiasts
                </p>
            </div>
        </div>
    );
}
