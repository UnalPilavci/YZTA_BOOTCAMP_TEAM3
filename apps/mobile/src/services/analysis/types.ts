export type RiskLevel = 'safe' | 'caution' | 'risk';

export type IngredientAnalysis = {
  name: string;
  code?: string;
  risk: RiskLevel;
  note: string;
};

export type PersonalAlert = {
  ingredient: string;
  matchLabelKey: string;
  severity: 'risk' | 'caution';
};

export type ScoreBreakdown = {
  processing: number;
  additives: number;
  nutrition: number;
};

export type AnalysisResult = {
  productName?: string;
  summary: string;
  healthScore: number;
  ingredients: IngredientAnalysis[];
  personalAlerts: PersonalAlert[];
  scoreBreakdown: ScoreBreakdown;
};

export type ProfileInput = {
  allergens: string[];
  sensitivities: string[];
};

export type MealFood = {
  name: string;
  kcal: number;
  quality: 'good' | 'ok' | 'poor';
};

export type MealMacros = { protein: number; carbs: number; fat: number };

export type MealScoreBreakdown = {
  processing: number;
  quality: number;
  balance: number;
};

export type MealResult = {
  mealName?: string;
  summary: string;
  mealScore: number;
  estCalories: number;
  foods: MealFood[];
  macros: MealMacros | null;
  fitnessNote: string;
  warnings: string[];
  scoreBreakdown: MealScoreBreakdown;
};
