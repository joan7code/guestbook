const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function generateWelcomeReply(
  name: string,
  message: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not set, skipping AI reply.');
    return '';
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      system:
        'You are a friendly and warm host of a guestbook. ' +
        'When someone leaves a message, write a short, genuine, and welcoming reply (1-2 sentences max). ' +
        'Be warm, personal, and reference what they said. Never use emojis. ' +
        'Reply in the same language as the visitor message.',
      messages: [
        {
          role: 'user',
          content: `${name} wrote: "${message}"`,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error('Anthropic API error:', await response.text());
    return '';
  }

  const data = await response.json();
  return data.content?.[0]?.text?.trim() ?? '';
}
