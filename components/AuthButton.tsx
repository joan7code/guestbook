'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">{user.email}</span>
        <button
          onClick={handleLogout}
          className="rounded-xl border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Link
        href="/login"
        className="rounded-xl border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
      >
        Sign in
      </Link>
      <Link
        href="/register"
        className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
      >
        Register
      </Link>
    </div>
  );
}
