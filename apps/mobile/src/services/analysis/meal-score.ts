import type { MealExtraction } from './vision/types';
import type { MealScoreBreakdown } from './types';

const PROCESSING_PENALTY: Record<MealExtraction['processing'], number> = {
  low: 0,
  medium: 15,
  high: 32,
};

const BALANCE_PENALTY: Record<MealExtraction['balance'], number> = {
  good: 0,
  ok: 10,
  poor: 22,
};

export function computeMealScore(extraction: MealExtraction): {
  score: number;
  breakdown: MealScoreBreakdown;
} {
  const processing = PROCESSING_PENALTY[extraction.processing];
  const balance = BALANCE_PENALTY[extraction.balance];

  const foods = extraction.foods;
  let quality = 0;
  if (foods.length > 0) {
    const weighted = foods.reduce(
      (sum, f) => sum + (f.quality === 'poor' ? 1 : f.quality === 'ok' ? 0.4 : 0),
      0,
    );
    quality = Math.min(30, Math.round((weighted / foods.length) * 30));
  }

  const score = Math.max(0, Math.min(100, 100 - processing - quality - balance));
  return { score, breakdown: { processing, quality, balance } };
}
