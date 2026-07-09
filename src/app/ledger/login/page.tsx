'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Leaf } from 'lucide-react';

const INPUT =
  'w-full bg-input border border-border/40 rounded-[1rem] px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all';

export default function LedgerLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const data = new FormData(e.currentTarget);

    const result = await signIn('credentials', {
      email: data.get('email'),
      password: data.get('password'),
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/ledger');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      {/* Glow */}
      <div className="pointer-events-none fixed -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 -left-32 w-[400px] h-[400px] rounded-full bg-accent/10 blur-3xl" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary/10 relative mb-4 shadow-soft">
            <Image src="/logo-lovable.png" alt="Talari Farms" fill className="object-cover" sizes="56px" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Partner Login</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Talari Farms Ledger</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-[2rem] p-8 shadow-elegant">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Email</label>
              <input name="email" type="email" required placeholder="your@email.com" className={INPUT} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Password</label>
              <input name="password" type="password" required placeholder="••••••••" className={INPUT} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-hero text-white py-3.5 rounded-[1rem] font-bold text-base shadow-elegant hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              <Leaf size={16} />
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Private access only. Contact admin to get an account.
        </p>
      </div>
    </div>
  );
}
