'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function GuestbookForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Your name
        </label>
        <input
          id="name"
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
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share a thought..."
          maxLength={500}
          rows={4}
          required
          disabled={isLoading}
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {message.length}/500
        </p>
      </div>

      {status === 'error' && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {errorMsg}
        </p>
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
