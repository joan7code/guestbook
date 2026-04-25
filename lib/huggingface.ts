// Using Hugging Face Inference API with Mistral-7B-Instruct
const HF_API_URL =
  'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3';

export async function generateWelcomeReply(
  name: string,
  message: string
): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    console.warn('HUGGINGFACE_API_KEY not set, skipping AI reply.');
    return '';
  }

  const prompt =
    `<s>[INST] You are a friendly and warm host of a guestbook. ` +
    `When someone leaves a message, write a short, genuine, and welcoming reply (1-2 sentences max). ` +
    `Be warm, personal, and reference what they said. Never use emojis. ` +
    `Reply in the same language as the visitor message.\n\n` +
    `${name} wrote: "${message}" [/INST]`;

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    console.error('Hugging Face API error:', await response.text());
    return '';
  }

  const data = await response.json();

  // HF returns an array of generated texts
  const text: string = Array.isArray(data)
    ? data[0]?.generated_text ?? ''
    : data?.generated_text ?? '';

  return text.trim();
}
