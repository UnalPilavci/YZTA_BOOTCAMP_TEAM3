import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseCategory = {
  id: string;
  label_tr: string;
  label_en: string;
  color: string;
  tint: string;
  icon: string;
  sort_order: number;
  active: boolean;
};

export type Exercise = {
  id: string;
  category_id: string;
  name_tr: string;
  name_en: string;
  met: number;
  difficulty: Difficulty;
  instructions_tr: string[];
  instructions_en: string[];
  image_url: string | null;
  sort_order: number;
  active: boolean;
};

export type ExerciseInput = Omit<Exercise, 'image_url'> & { image_url: string | null };

const MEDIA_BUCKET = 'exercise-media';

export async function listExerciseCategories(): Promise<ExerciseCategory[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('exercise_categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ExerciseCategory[];
}

export async function upsertExerciseCategory(input: ExerciseCategory): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('exercise_categories').upsert(input, { onConflict: 'id' });
  if (error) throw error;
}

export async function setExerciseCategoryActive(id: string, active: boolean): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('exercise_categories').update({ active }).eq('id', id);
  if (error) throw error;
}

export async function listExercises(): Promise<Exercise[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Exercise[];
}

export async function getExercise(id: string): Promise<Exercise | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('exercises').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as Exercise) ?? null;
}

export async function upsertExercise(input: ExerciseInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('exercises').upsert(input, { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteExercise(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('exercises').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadExerciseMedia(file: File): Promise<string> {
  const supabase = createAdminClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;
  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, buffer, { contentType: file.type || 'image/jpeg', upsert: false });
  if (error) throw error;
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}
