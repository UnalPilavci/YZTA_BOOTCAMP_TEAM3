import { VisionError } from './errors';
import { parseExtraction, parseMealExtraction } from './parse';
import { EXTRACTION_INSTRUCTION, MEAL_INSTRUCTION } from './prompt';
import type { MealExtraction, VisionExtraction, VisionInput, VisionProvider } from './types';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

type GroqConfig = { apiKey: string; model: string };

export function createGroqProvider(config: GroqConfig): VisionProvider {
  return {
    id: 'groq',
    async extract(input: VisionInput): Promise<VisionExtraction> {
      const content = await requestGroq(config, input, EXTRACTION_INSTRUCTION);
      return parseExtraction(content);
    },
    async extractMeal(input: VisionInput): Promise<MealExtraction> {
      const content = await requestGroq(config, input, MEAL_INSTRUCTION);
      return parseMealExtraction(content);
    },
  };
}

async function requestGroq(
  config: GroqConfig,
  input: VisionInput,
  instruction: string,
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.1,
        max_tokens: 1500,
        reasoning_effort: 'none',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: instruction },
              {
                type: 'image_url',
                image_url: { url: `data:${input.mimeType};base64,${input.base64}` },
              },
            ],
          },
        ],
      }),
    });
  } catch (e) {
    throw new VisionError('network', 'result.errNetwork', `groq fetch failed: ${String(e)}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new VisionError(
      'network',
      'result.errNetwork',
      `groq ${res.status}: ${body.slice(0, 300)}`,
    );
  }

  const data = (await res.json().catch(() => null)) as {
    choices?: { message?: { content?: string } }[];
  } | null;
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new VisionError('parse', 'result.errParse', 'empty groq content');
  return content;
}
