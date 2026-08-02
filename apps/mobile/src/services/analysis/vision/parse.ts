import type { IngredientAnalysis, RiskLevel } from '../types';
import { VisionError } from './errors';
import type { MealExtraction, MealFoodExtraction, VisionExtraction } from './types';

const RISK_LEVELS: RiskLevel[] = ['safe', 'caution', 'risk'];

export function parseExtraction(raw: string): VisionExtraction {
  let data: unknown;
  try {
    data = JSON.parse(extractJsonBlock(raw));
  } catch {
    throw new VisionError('parse', 'result.errParse');
  }

  const obj = (data ?? {}) as Record<string, unknown>;
  if (obj.readable === false) {
    throw new VisionError('unreadable', 'result.errUnreadable');
  }

  const rawList = Array.isArray(obj.ingredients) ? obj.ingredients : [];
  const ingredients: IngredientAnalysis[] = [];

  for (const entry of rawList) {
    const item = (entry ?? {}) as Record<string, unknown>;
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    if (!name) continue;

    const risk: RiskLevel = RISK_LEVELS.includes(item.risk as RiskLevel)
      ? (item.risk as RiskLevel)
      : 'caution';
    const code =
      typeof item.code === 'string' && item.code.trim()
        ? item.code.trim().toUpperCase()
        : undefined;
    const note = typeof item.note === 'string' ? item.note.trim() : '';

    ingredients.push({ name, code, risk, note });
  }

  if (ingredients.length === 0) {
    throw new VisionError('unreadable', 'result.errUnreadable');
  }

  const productName =
    typeof obj.productName === 'string' && obj.productName.trim()
      ? obj.productName.trim()
      : undefined;

  return { productName, ingredients };
}

const QUALITIES: MealFoodExtraction['quality'][] = ['good', 'ok', 'poor'];
const BALANCES: MealExtraction['balance'][] = ['good', 'ok', 'poor'];
const PROCESSINGS: MealExtraction['processing'][] = ['low', 'medium', 'high'];

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

export function parseMealExtraction(raw: string): MealExtraction {
  let data: unknown;
  try {
    data = JSON.parse(extractJsonBlock(raw));
  } catch {
    throw new VisionError('parse', 'result.errParse');
  }

  const obj = (data ?? {}) as Record<string, unknown>;
  if (obj.readable === false) {
    throw new VisionError('unreadable', 'result.errMealUnreadable');
  }

  const rawFoods = Array.isArray(obj.foods) ? obj.foods : [];
  const foods: MealFoodExtraction[] = [];
  for (const entry of rawFoods) {
    const item = (entry ?? {}) as Record<string, unknown>;
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    if (!name) continue;
    const quality = QUALITIES.includes(item.quality as MealFoodExtraction['quality'])
      ? (item.quality as MealFoodExtraction['quality'])
      : 'ok';
    foods.push({ name, kcal: num(item.kcal), quality });
  }

  if (foods.length === 0) {
    throw new VisionError('unreadable', 'result.errMealUnreadable');
  }

  const rawMacros = (obj.macros ?? null) as Record<string, unknown> | null;
  const macros =
    rawMacros && typeof rawMacros === 'object'
      ? {
          protein: num(rawMacros.protein),
          carbs: num(rawMacros.carbs),
          fat: num(rawMacros.fat),
        }
      : null;

  const balance = BALANCES.includes(obj.balance as MealExtraction['balance'])
    ? (obj.balance as MealExtraction['balance'])
    : 'ok';
  const processing = PROCESSINGS.includes(obj.processing as MealExtraction['processing'])
    ? (obj.processing as MealExtraction['processing'])
    : 'medium';

  const estCalories =
    num(obj.estCalories) || foods.reduce((sum, f) => sum + f.kcal, 0);

  const warnings = Array.isArray(obj.warnings)
    ? obj.warnings.filter((w): w is string => typeof w === 'string' && w.trim().length > 0)
    : [];

  return {
    mealName:
      typeof obj.mealName === 'string' && obj.mealName.trim() ? obj.mealName.trim() : undefined,
    estCalories,
    foods,
    macros,
    balance,
    processing,
    fitnessNote: typeof obj.fitnessNote === 'string' ? obj.fitnessNote.trim() : '',
    warnings,
  };
}

function extractJsonBlock(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : raw;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return body.trim();
  return body.slice(start, end + 1);
}
