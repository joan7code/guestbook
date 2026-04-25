// Using Cohere API - free tier, no credit card required
const COHERE_API_URL = 'https://api.cohere.com/v2/chat';

export async function generateWelcomeReply(
  name: string,
  message: string
): Promise<string> {
  const apiKey = process.env.COHERE_API_KEY;

  if (!apiKey) {
    console.warn('COHERE_API_KEY not set, skipping AI reply.');
    return '';
  }

  const response = await fetch(COHERE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'command-r-plus-08-2024',
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly and warm host of a guestbook. ' +
            'When someone leaves a message, write a short, genuine, and welcoming reply (1-2 sentences max). ' +
            'Be warm, personal, and reference what they said. Never use emojis. ' +
            'Reply in the same language as the visitor message.',
        },
        {
          role: 'user',
          content: `${name} wrote: "${message}"`,
        },
      ],
      max_tokens: 100,
    }),
  });

  if (!response.ok) {
    console.error('Cohere API error:', await response.text());
    return '';
  }

  const data = await response.json();
  return data.message?.content?.[0]?.text?.trim() ?? '';
}
