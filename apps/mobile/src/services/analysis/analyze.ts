import { matchPersonalAlerts } from './allergen-match';
import { computeHealthScore } from './health-score';
import { computeMealScore } from './meal-score';
import type { AnalysisResult, IngredientAnalysis, MealResult, ProfileInput } from './types';
import { getVisionProvider, prepareImage, type VisionExtraction } from './vision';

async function extractIngredients(imageUri: string): Promise<VisionExtraction> {
  const provider = getVisionProvider();
  const input = await prepareImage(imageUri);
  return provider.extract(input);
}

function buildSummary(
  score: number,
  ingredients: IngredientAnalysis[],
  alertCount: number,
): string {
  const additives = ingredients.filter((i) => !!i.code).length;
  if (alertCount > 0) {
    return `Profiline uymayan ${alertCount} madde bulundu. Dikkatli ol.`;
  }
  if (score >= 80) return 'Temiz ve dengeli bir ürün. Rahatça tüketebilirsin.';
  if (score >= 45) return `Orta düzey işlenmiş; ${additives} katkı maddesi içeriyor.`;
  return 'Yüksek işlenmiş, katkı maddesi yoğun bir ürün.';
}

export async function analyzeImage(
  imageUri: string,
  profile: ProfileInput,
): Promise<AnalysisResult> {
  const { productName, ingredients } = await extractIngredients(imageUri);

  const personalAlerts = matchPersonalAlerts(ingredients, profile);
  const { score, breakdown } = computeHealthScore(ingredients);
  const summary = buildSummary(score, ingredients, personalAlerts.length);

  return {
    productName,
    summary,
    healthScore: score,
    ingredients,
    personalAlerts,
    scoreBreakdown: breakdown,
  };
}

function buildMealSummary(score: number, calories: number): string {
  if (score >= 80) return `Dengeli bir öğün (~${calories} kcal). Afiyet olsun.`;
  if (score >= 45) return `Orta düzey bir öğün (~${calories} kcal). Dengeye dikkat.`;
  return `Ağır/işlenmiş bir öğün (~${calories} kcal). Ölçülü tüket.`;
}

export async function analyzeMeal(imageUri: string): Promise<MealResult> {
  const provider = getVisionProvider();
  const input = await prepareImage(imageUri);
  const extraction = await provider.extractMeal(input);

  const { score, breakdown } = computeMealScore(extraction);

  return {
    mealName: extraction.mealName,
    summary: buildMealSummary(score, extraction.estCalories),
    mealScore: score,
    estCalories: extraction.estCalories,
    foods: extraction.foods,
    macros: extraction.macros,
    fitnessNote: extraction.fitnessNote,
    warnings: extraction.warnings,
    scoreBreakdown: breakdown,
  };
}
