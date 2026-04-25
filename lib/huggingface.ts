// Using Hugging Face Inference API with Zephyr-7B
const HF_MODEL = 'HuggingFaceH4/zephyr-7b-beta';
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/v1/chat/completions`;

export async function generateWelcomeReply(
  name: string,
  message: string
): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    console.warn('HUGGINGFACE_API_KEY not set, skipping AI reply.');
    return '';
  }

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: HF_MODEL,
      max_tokens: 100,
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
    }),
  });

  if (!response.ok) {
    console.error('Hugging Face API error:', await response.text());
    return '';
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}
