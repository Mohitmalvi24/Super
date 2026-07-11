import config from '../config/environment';

const MODELS = [
  'llama-3.1-8b-instant',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
];

const RETRY_DELAY_MS = 1200;

export async function callLlm(prompt: string): Promise<string> {
  const key = config.groqApiKey;

  if (!key) {
    throw new Error('Groq API key not configured');
  }

  for (const model of MODELS) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch {
      // Try the next model.
    }

    await delay(RETRY_DELAY_MS);
  }

  throw new Error('All LLM models failed or were rate-limited');
}

export function parseLlmJson<T>(raw: string): T {
  try {
    return JSON.parse(raw);
  } catch {
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
