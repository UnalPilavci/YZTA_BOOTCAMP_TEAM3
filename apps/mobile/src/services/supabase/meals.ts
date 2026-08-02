import type {
  MealFood,
  MealMacros,
  MealScoreBreakdown,
} from '@/services/analysis/types';
import type { MealRecord } from '@/store/meals';

import { supabase } from './client';

type MealRow = {
  id: string;
  meal_name: string | null;
  summary: string;
  meal_score: number;
  est_calories: number;
  foods: MealFood[];
  macros: MealMacros | null;
  fitness_note: string;
  warnings: string[];
  score_breakdown: MealScoreBreakdown;
  created_at: string;
};

const COLUMNS =
  'id, meal_name, summary, meal_score, est_calories, foods, macros, fitness_note, warnings, score_breakdown, created_at';

function fromRow(row: MealRow): MealRecord {
  return {
    id: row.id,
    mealName: row.meal_name ?? undefined,
    summary: row.summary ?? '',
    mealScore: row.meal_score,
    estCalories: row.est_calories,
    foods: row.foods ?? [],
    macros: row.macros ?? null,
    fitnessNote: row.fitness_note ?? '',
    warnings: row.warnings ?? [],
    scoreBreakdown: row.score_breakdown ?? { processing: 0, quality: 0, balance: 0 },
    createdAt: Date.parse(row.created_at),
    syncedAt: Date.now(),
  };
}

export async function upsertMeal(userId: string, rec: MealRecord): Promise<void> {
  const { error } = await supabase.from('meals').upsert(
    {
      id: rec.id,
      user_id: userId,
      meal_name: rec.mealName ?? null,
      summary: rec.summary,
      meal_score: rec.mealScore,
      est_calories: rec.estCalories,
      foods: rec.foods,
      macros: rec.macros,
      fitness_note: rec.fitnessNote,
      warnings: rec.warnings,
      score_breakdown: rec.scoreBreakdown,
      created_at: new Date(rec.createdAt).toISOString(),
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
}

export async function fetchMeals(userId: string, limit: number): Promise<MealRecord[]> {
  const { data, error } = await supabase
    .from('meals')
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as MealRow[] | null)?.map(fromRow) ?? [];
}

export async function deleteMeal(id: string): Promise<void> {
  const { error } = await supabase.from('meals').delete().eq('id', id);
  if (error) throw error;
}
