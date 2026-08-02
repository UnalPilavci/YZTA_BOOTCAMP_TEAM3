import { pickMockProduct } from '../mock-products';
import { VisionError } from './errors';
import { createGroqProvider } from './groq';
import type { MealExtraction, VisionExtraction, VisionProvider } from './types';

const PROVIDER = (process.env.EXPO_PUBLIC_VISION_PROVIDER ?? 'groq').toLowerCase();
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
const GROQ_MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL ?? 'qwen/qwen3.6-27b';

const mockProvider: VisionProvider = {
  id: 'mock',
  async extract(): Promise<VisionExtraction> {
    await new Promise((r) => setTimeout(r, 1200));
    const product = pickMockProduct();
    return { productName: product.productName, ingredients: product.ingredients };
  },
  async extractMeal(): Promise<MealExtraction> {
    await new Promise((r) => setTimeout(r, 1200));
    return {
      mealName: 'Izgara tavuk & bulgur pilavı',
      estCalories: 520,
      foods: [
        { name: 'Izgara tavuk göğsü', kcal: 220, quality: 'good' },
        { name: 'Bulgur pilavı', kcal: 210, quality: 'ok' },
        { name: 'Mevsim salata', kcal: 90, quality: 'good' },
      ],
      macros: { protein: 42, carbs: 55, fat: 14 },
      balance: 'good',
      processing: 'low',
      fitnessNote: 'Yüksek proteinli ve dengeli — antrenman sonrası için uygun.',
      warnings: ['Salata sosunu ölçülü kullan.'],
    };
  },
};

export function getVisionProvider(): VisionProvider {
  switch (PROVIDER) {
    case 'mock':
      return mockProvider;

    case 'gemini':
      throw new VisionError('config', 'result.errConfig', 'gemini provider not implemented yet');

    case 'groq':
    default:
      if (!GROQ_API_KEY) throw new VisionError('config', 'result.errConfig');
      return createGroqProvider({ apiKey: GROQ_API_KEY, model: GROQ_MODEL });
  }
}

export { prepareImage } from './image';
export { VisionError } from './errors';
export type { VisionExtraction, VisionInput, VisionProvider } from './types';
