const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

export async function generateWelcomeReply(
  name: string,
  message: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, skipping AI reply.');
    return '';
  }

  const prompt =
    `You are a friendly and warm host of a guestbook. ` +
    `When someone leaves a message, write a short, genuine, and welcoming reply (1-2 sentences max). ` +
    `Be warm, personal, and reference what they said. Never use emojis. ` +
    `Reply in the same language as the visitor message.\n\n` +
    `${name} wrote: "${message}"`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 100, temperature: 0.7 },
    }),
  });

  if (!response.ok) {
    console.error('Gemini API error:', await response.text());
    return '';
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}
