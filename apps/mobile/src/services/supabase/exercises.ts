import { supabase } from './client';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseCategoryRow = {
  id: string;
  labelTr: string;
  labelEn: string;
  color: string;
  tint: string;
  icon: string;
  sortOrder: number;
};

export type ExerciseRow = {
  id: string;
  categoryId: string;
  nameTr: string;
  nameEn: string;
  met: number;
  difficulty: Difficulty;
  instructionsTr: string[];
  instructionsEn: string[];
  imageUrl: string | null;
  sortOrder: number;
};

type CatDb = {
  id: string;
  label_tr: string;
  label_en: string;
  color: string;
  tint: string;
  icon: string;
  sort_order: number;
};
type ExDb = {
  id: string;
  category_id: string;
  name_tr: string;
  name_en: string;
  met: number;
  difficulty: Difficulty;
  instructions_tr: unknown;
  instructions_en: unknown;
  image_url: string | null;
  sort_order: number;
};

const asSteps = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : [];

export async function fetchExerciseCategories(): Promise<ExerciseCategoryRow[]> {
  const { data, error } = await supabase
    .from('exercise_categories')
    .select('id, label_tr, label_en, color, tint, icon, sort_order')
    .eq('active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return ((data as CatDb[] | null) ?? []).map((c) => ({
    id: c.id,
    labelTr: c.label_tr,
    labelEn: c.label_en,
    color: c.color,
    tint: c.tint,
    icon: c.icon,
    sortOrder: c.sort_order,
  }));
}

export async function fetchExercises(): Promise<ExerciseRow[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select(
      'id, category_id, name_tr, name_en, met, difficulty, instructions_tr, instructions_en, image_url, sort_order',
    )
    .eq('active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return ((data as ExDb[] | null) ?? []).map((e) => ({
    id: e.id,
    categoryId: e.category_id,
    nameTr: e.name_tr,
    nameEn: e.name_en,
    met: Number(e.met),
    difficulty: e.difficulty,
    instructionsTr: asSteps(e.instructions_tr),
    instructionsEn: asSteps(e.instructions_en),
    imageUrl: e.image_url,
    sortOrder: e.sort_order,
  }));
}
