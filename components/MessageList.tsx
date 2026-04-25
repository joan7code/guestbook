import { type Message } from '@/lib/supabase';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
];

function getColor(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

interface Props {
  messages: Message[];
}

export default function MessageList({ messages }: Props) {
  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-14 text-center">
        <span className="text-4xl">✍️</span>
        <p className="mt-3 text-sm text-gray-400">Be the first to leave a message!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {messages.map((msg) => (
        <li
          key={msg.id}
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                getColor(msg.name)
              }`}
            >
              {getInitials(msg.name)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-semibold text-gray-900">{msg.name}</span>
                {msg.user_email && (
                  <span className="text-xs text-gray-400">{msg.user_email}</span>
                )}
                <span className="text-xs text-gray-400">{formatDate(msg.created_at)}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                {msg.message}
              </p>

              {msg.ai_reply && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-indigo-50 px-3 py-2.5">
                  <span className="mt-0.5 text-sm">🤖</span>
                  <p className="text-sm italic leading-relaxed text-indigo-700">
                    {msg.ai_reply}
                  </p>
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
