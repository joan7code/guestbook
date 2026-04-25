import GuestbookForm from '@/components/GuestbookForm';
import MessageList from '@/components/MessageList';
import { supabase, type Message } from '@/lib/supabase';

async function getMessages(): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data ?? [];
}

export const revalidate = 0;

export default async function Home() {
  const messages = await getMessages();

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center justify-center rounded-2xl bg-indigo-100 p-3">
            <span className="text-3xl">📖</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Guestbook
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Leave a message — say hi, share a thought, or just drop your name!
          </p>
        </div>

        {/* Form */}
        <div className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Write a message</h2>
          <GuestbookForm />
        </div>

        {/* Message list */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            {messages.length > 0
              ? `${messages.length} message${messages.length !== 1 ? 's' : ''}`
              : 'No messages yet'}
          </h2>
          <MessageList messages={messages} />
        </div>
      </div>
    </main>
  );
}
