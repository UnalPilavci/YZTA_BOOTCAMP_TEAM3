'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { assertAdmin } from '@/lib/auth/assert-admin';
import { writeAudit } from '@/lib/audit';
import {
  deleteExercise,
  setExerciseCategoryActive,
  upsertExercise,
  upsertExerciseCategory,
  uploadExerciseMedia,
  type Difficulty,
} from '@/features/exercises/service';

function slugify(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function linesToArray(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function saveExerciseAction(formData: FormData): Promise<void> {
  const { actorId } = await assertAdmin();
  const isNew = String(formData.get('is_new') ?? '') === '1';
  const rawId = String(formData.get('id') ?? '').trim();
  const id = isNew ? slugify(rawId) : rawId;
  if (!id) throw new Error('Egzersiz kimliği gerekli.');

  const coverFile = formData.get('image');
  let imageUrl = (String(formData.get('image_url') ?? '').trim() || null) as string | null;
  if (coverFile instanceof File && coverFile.size > 0) {
    imageUrl = await uploadExerciseMedia(coverFile);
  }

  await upsertExercise({
    id,
    category_id: String(formData.get('category_id') ?? ''),
    name_tr: String(formData.get('name_tr') ?? '').trim(),
    name_en: String(formData.get('name_en') ?? '').trim(),
    met: Number(formData.get('met') ?? 3.5) || 3.5,
    difficulty: (String(formData.get('difficulty') ?? 'beginner') as Difficulty),
    instructions_tr: linesToArray(String(formData.get('instructions_tr') ?? '')),
    instructions_en: linesToArray(String(formData.get('instructions_en') ?? '')),
    image_url: imageUrl,
    sort_order: Number(formData.get('sort_order') ?? 0) || 0,
    active: String(formData.get('active') ?? '') === 'on',
  });
  await writeAudit({ actorId, action: 'exercise.save', entity: 'exercises', entityId: id });
  revalidatePath('/exercises');
  redirect('/exercises');
}

export async function deleteExerciseAction(id: string): Promise<void> {
  const { actorId } = await assertAdmin();
  await deleteExercise(id);
  await writeAudit({ actorId, action: 'exercise.delete', entity: 'exercises', entityId: id });
  revalidatePath('/exercises');
  redirect('/exercises');
}

export async function saveExerciseCategoryAction(formData: FormData): Promise<void> {
  const { actorId } = await assertAdmin();
  const isNew = String(formData.get('is_new') ?? '') === '1';
  const rawId = String(formData.get('id') ?? '').trim();
  const id = isNew ? slugify(rawId) : rawId;
  if (!id) throw new Error('Kategori kimliği gerekli.');

  await upsertExerciseCategory({
    id,
    label_tr: String(formData.get('label_tr') ?? '').trim(),
    label_en: String(formData.get('label_en') ?? '').trim(),
    color: String(formData.get('color') ?? '#64748B').trim() || '#64748B',
    tint: String(formData.get('tint') ?? '#E7EAEE').trim() || '#E7EAEE',
    icon: String(formData.get('icon') ?? 'Dumbbell').trim() || 'Dumbbell',
    sort_order: Number(formData.get('sort_order') ?? 0) || 0,
    active: String(formData.get('active') ?? '') === 'on',
  });
  await writeAudit({
    actorId,
    action: 'exercise_category.save',
    entity: 'exercise_categories',
    entityId: id,
  });
  revalidatePath('/exercises');
}

export async function toggleExerciseCategoryActiveAction(id: string, active: boolean): Promise<void> {
  const { actorId } = await assertAdmin();
  await setExerciseCategoryActive(id, active);
  await writeAudit({
    actorId,
    action: active ? 'exercise_category.activate' : 'exercise_category.deactivate',
    entity: 'exercise_categories',
    entityId: id,
  });
  revalidatePath('/exercises');
}
