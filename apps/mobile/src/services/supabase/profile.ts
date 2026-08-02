import { normalizePlan, type PlanId } from '@/data/plans';
import type { ActivityLevel, Goal, Sex } from '@/data/nutrition-targets';

import { supabase } from './client';

export type ProfileSnapshot = {
  completed: boolean;
  name: string;
  phone: string;
  heightCm: string;
  weightKg: string;
  waistCm: string;
  hipCm: string;
  neckCm: string;
  chestCm: string;
  armCm: string;
  thighCm: string;
  allergens: string[];
  sensitivities: string[];
  diets: string[];
  conditions: string[];
  isTrainer: boolean;
  plan: PlanId;
  goal: Goal | null;
  activityLevel: ActivityLevel | null;
  sex: Sex | null;
  birthDate: string | null;
  targetWeightKg: string;
};

type ProfileRow = {
  completed: boolean;
  name: string;
  phone: string;
  height_cm: number | null;
  weight_kg: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  neck_cm: number | null;
  chest_cm: number | null;
  arm_cm: number | null;
  thigh_cm: number | null;
  allergens: string[];
  sensitivities: string[];
  diets: string[];
  conditions: string[];
  is_trainer: boolean;
  plan: string | null;
  goal: Goal | null;
  activity_level: ActivityLevel | null;
  sex: Sex | null;
  birth_date: string | null;
  target_weight_kg: number | null;
};

function toNumber(raw: string): number | null {
  const n = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(n) ? n : null;
}

function fromRow(row: ProfileRow): ProfileSnapshot {
  return {
    completed: row.completed,
    name: row.name ?? '',
    phone: row.phone ?? '',
    heightCm: row.height_cm == null ? '' : String(row.height_cm),
    weightKg: row.weight_kg == null ? '' : String(row.weight_kg),
    waistCm: row.waist_cm == null ? '' : String(row.waist_cm),
    hipCm: row.hip_cm == null ? '' : String(row.hip_cm),
    neckCm: row.neck_cm == null ? '' : String(row.neck_cm),
    chestCm: row.chest_cm == null ? '' : String(row.chest_cm),
    armCm: row.arm_cm == null ? '' : String(row.arm_cm),
    thighCm: row.thigh_cm == null ? '' : String(row.thigh_cm),
    allergens: row.allergens ?? [],
    sensitivities: row.sensitivities ?? [],
    diets: row.diets ?? [],
    conditions: row.conditions ?? [],
    isTrainer: row.is_trainer ?? false,
    plan: normalizePlan(row.plan),
    goal: row.goal ?? null,
    activityLevel: row.activity_level ?? null,
    sex: row.sex ?? null,
    birthDate: row.birth_date ?? null,
    targetWeightKg: row.target_weight_kg == null ? '' : String(row.target_weight_kg),
  };
}

export async function fetchProfile(userId: string): Promise<ProfileSnapshot | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'completed, name, phone, height_cm, weight_kg, waist_cm, hip_cm, neck_cm, chest_cm, arm_cm, thigh_cm, allergens, sensitivities, diets, conditions, is_trainer, plan, goal, activity_level, sex, birth_date, target_weight_kg',
    )
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? fromRow(data as ProfileRow) : null;
}

export async function saveProfile(userId: string, p: ProfileSnapshot): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      completed: p.completed,
      name: p.name,
      phone: p.phone,
      height_cm: toNumber(p.heightCm),
      weight_kg: toNumber(p.weightKg),
      waist_cm: toNumber(p.waistCm),
      hip_cm: toNumber(p.hipCm),
      neck_cm: toNumber(p.neckCm),
      chest_cm: toNumber(p.chestCm),
      arm_cm: toNumber(p.armCm),
      thigh_cm: toNumber(p.thighCm),
      allergens: p.allergens,
      sensitivities: p.sensitivities,
      diets: p.diets,
      conditions: p.conditions,
      is_trainer: p.isTrainer,
      plan: p.plan,
      goal: p.goal,
      activity_level: p.activityLevel,
      sex: p.sex,
      birth_date: p.birthDate,
      target_weight_kg: toNumber(p.targetWeightKg),
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
}
