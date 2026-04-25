const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function generateWelcomeReply(
  name: string,
  message: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.warn('GROQ_API_KEY not set, skipping AI reply.');
    return '';
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly and warm host of a guestbook. ' +
            'When someone leaves a message, you write a short, genuine, and welcoming reply (1-2 sentences max). ' +
            'Be warm, personal, and reference what they said. Never use emojis. Reply in the same language as the visitor message.',
        },
        {
          role: 'user',
          content: `${name} wrote: "${message}"`,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error('Groq API error:', await response.text());
    return '';
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}
