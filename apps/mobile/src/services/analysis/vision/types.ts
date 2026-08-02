import type { IngredientAnalysis } from '../types';

export type VisionInput = {
  base64: string;
  mimeType: string;
};

export type VisionExtraction = {
  productName?: string;
  ingredients: IngredientAnalysis[];
};

export type MealFoodExtraction = {
  name: string;
  kcal: number;
  quality: 'good' | 'ok' | 'poor';
};

export type MealExtraction = {
  mealName?: string;
  estCalories: number;
  foods: MealFoodExtraction[];
  macros: { protein: number; carbs: number; fat: number } | null;
  balance: 'good' | 'ok' | 'poor';
  processing: 'low' | 'medium' | 'high';
  fitnessNote: string;
  warnings: string[];
};

export interface VisionProvider {
  readonly id: string;
  extract(input: VisionInput): Promise<VisionExtraction>;
  extractMeal(input: VisionInput): Promise<MealExtraction>;
}
