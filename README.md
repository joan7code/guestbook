# 📖 Guestbook

A simple, clean guestbook app built with **Next.js 14** (App Router), **Tailwind CSS**, and **Supabase**.

## Features

- ✍️ Submit messages with name and text
- 📋 View all messages sorted by newest first
- ⚡ Server-side rendering with `revalidate = 0` for fresh data
- 📱 Fully responsive (mobile & desktop)
- 🎨 Clean UI with avatar initials and color coding

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the following SQL in your Supabase SQL editor:

```sql
create table messages (
  id bigint generated always as identity primary key,
  name text not null,
  message text not null,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table messages enable row level security;

-- Grant permissions to the anon role
grant select on messages to anon;
grant insert on messages to anon;

-- Allow anyone to read messages
create policy "Anyone can read messages"
  on messages for select
  using (true);

-- Allow anyone to insert messages
create policy "Anyone can insert messages"
  on messages for insert
  with check (true);
```

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find both values in your Supabase project under **Settings → API → Project URL** and **anon / public key**.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Deploy easily on [Vercel](https://vercel.com). Remember to add the environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in your Vercel project settings.

## Project Structure

```
guestbook/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (SSR)
│   ├── globals.css         # Global styles
│   └── api/
│       └── messages/
│           └── route.ts    # POST API endpoint
├── components/
│   ├── GuestbookForm.tsx   # Client form component
│   └── MessageList.tsx     # Message display component
├── lib/
│   └── supabase.ts         # Supabase client + types
└── .env.local.example      # Env vars template
```
