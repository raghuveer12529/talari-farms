'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * Toggles `dark` on the nearest `.erp` wrapper (and mirrors it onto
 * <html> so portalled dialogs pick it up). Persists to localStorage.
 */
export function ThemeToggle() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem('erp-theme');
    const isDark = stored === 'dark';
    setDark(isDark);
    apply(isDark);
  }, []);

  const apply = (isDark: boolean) => {
    document.querySelectorAll('.erp').forEach((el) => el.classList.toggle('dark', isDark));
    document.documentElement.classList.toggle('dark', isDark);
  };

  const toggle = () => {
    const next = !dark;
    setDark(next);
    apply(next);
    localStorage.setItem('erp-theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-foreground/70 transition-colors hover:text-foreground"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
