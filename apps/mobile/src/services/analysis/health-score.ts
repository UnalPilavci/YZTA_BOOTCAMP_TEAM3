import type { IngredientAnalysis, ScoreBreakdown } from './types';

const RISK_PENALTY: Record<IngredientAnalysis['risk'], number> = {
  safe: 0,
  caution: 7,
  risk: 15,
};

export function computeHealthScore(ingredients: IngredientAnalysis[]): {
  score: number;
  breakdown: ScoreBreakdown;
} {
  if (ingredients.length === 0) {
    return { score: 100, breakdown: { processing: 0, additives: 0, nutrition: 0 } };
  }

  const additiveCount = ingredients.filter((i) => !!i.code).length;
  const additives = Math.min(35, additiveCount * 6);

  const flagged = ingredients.filter((i) => i.risk !== 'safe').length;
  const processing = Math.min(40, Math.round((flagged / ingredients.length) * 40));

  const rawPenalty = ingredients.reduce((sum, i) => sum + RISK_PENALTY[i.risk], 0);
  const nutrition = Math.min(25, Math.round(rawPenalty / 4));

  const score = Math.max(0, Math.min(100, 100 - processing - additives - nutrition));
  return { score, breakdown: { processing, additives, nutrition } };
}
