'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function logout() {
    setIsSubmitting(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.localStorage.clear();
      window.sessionStorage.clear();
      router.push('/auth');
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={isSubmitting}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
      aria-label="Logout"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">{isSubmitting ? 'Logging out...' : 'Logout'}</span>
    </button>
  );
}
