import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateWelcomeReply } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, message } = body;

    if (!name || !message) {
      return NextResponse.json(
        { error: 'Name and message are required.' },
        { status: 400 }
      );
    }

    if (name.trim().length > 100 || message.trim().length > 500) {
      return NextResponse.json(
        { error: 'Name or message is too long.' },
        { status: 400 }
      );
    }

    // Generate AI welcome reply via Groq (non-blocking on failure)
    const ai_reply = await generateWelcomeReply(name.trim(), message.trim()).catch(
      () => ''
    );

    const { data, error } = await supabase
      .from('messages')
      .insert([{ name: name.trim(), message: message.trim(), ai_reply }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save message. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
