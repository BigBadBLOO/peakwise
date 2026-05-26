const BASE_URL = 'https://api.anthropic.com/v1';
const MODEL = 'claude-haiku-4-5-20251001';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function claudeChat(
  apiKey: string,
  messages: Message[],
  systemPrompt?: string,
): Promise<string> {
  const response = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message ?? `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text as string;
}
