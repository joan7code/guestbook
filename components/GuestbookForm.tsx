'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function GuestbookForm() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="rounded-xl bg-gray-50 px-4 py-6 text-center">
        <p className="text-sm text-gray-500">
          You need to{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">sign in</Link>
          {' '}or{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:underline">register</Link>
          {' '}to leave a message.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error ?? 'Something went wrong.');
        return;
      }

      setStatus('success');
      setName('');
      setMessage('');
      router.refresh();
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  };

  const isLoading = status === 'loading';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Your name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Jane Doe"
          maxLength={100}
          required
          disabled={isLoading}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share a thought..."
          maxLength={500}
          rows={4}
          required
          disabled={isLoading}
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{message.length}/500</p>
      </div>

      {status === 'error' && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{errorMsg}</p>
      )}
      {status === 'success' && (
        <p className="rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-600">
          ✓ Message sent! Thanks for signing the guestbook.
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || !name.trim() || !message.trim()}
        className="w-full rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Sending…' : 'Sign the Guestbook'}
      </button>
    </form>
  );
}
