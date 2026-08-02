export type Sex = 'female' | 'male' | 'other';
export type Goal = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type MacroTargets = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const GOALS: Goal[] = ['lose', 'maintain', 'gain'];
export const ACTIVITY_LEVELS: ActivityLevel[] = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active',
];
export const SEXES: Sex[] = ['female', 'male', 'other'];

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_KCAL_DELTA: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

const GOAL_PROTEIN_PER_KG: Record<Goal, number> = {
  lose: 1.6,
  maintain: 1.4,
  gain: 2.0,
};

function bmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === 'male') return base + 5;
  if (sex === 'female') return base - 161;
  return base - 78;
}

export type TargetInput = {
  sex: Sex;
  birthYear: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
  currentYear?: number;
};

export function computeTargets(input: TargetInput): MacroTargets | null {
  const year = input.currentYear ?? new Date().getFullYear();
  const age = year - input.birthYear;
  if (
    !Number.isFinite(input.heightCm) ||
    !Number.isFinite(input.weightKg) ||
    input.heightCm < 100 ||
    input.heightCm > 250 ||
    input.weightKg < 20 ||
    input.weightKg > 400 ||
    age < 13 ||
    age > 100
  ) {
    return null;
  }

  const tdee = bmr(input.sex, input.weightKg, input.heightCm, age) * ACTIVITY_MULTIPLIER[input.activity];
  const kcal = Math.max(1200, Math.round((tdee + GOAL_KCAL_DELTA[input.goal]) / 10) * 10);

  const protein = Math.round(input.weightKg * GOAL_PROTEIN_PER_KG[input.goal]);
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));

  return { kcal, protein, carbs, fat };
}
