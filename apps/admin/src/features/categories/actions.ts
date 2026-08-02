'use server';

import { revalidatePath } from 'next/cache';

import { assertAdmin } from '@/lib/auth/assert-admin';
import { writeAudit } from '@/lib/audit';
import { setCategoryActive, upsertCategory } from '@/features/categories/service';

function slugify(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function saveCategoryAction(formData: FormData): Promise<void> {
  const { actorId } = await assertAdmin();
  const rawId = String(formData.get('id') ?? '').trim();
  const isNew = String(formData.get('is_new') ?? '') === '1';
  const id = isNew ? slugify(rawId) : rawId;
  if (!id) throw new Error('Kategori kimliği gerekli.');

  await upsertCategory({
    id,
    label_tr: String(formData.get('label_tr') ?? '').trim(),
    label_en: String(formData.get('label_en') ?? '').trim(),
    color: String(formData.get('color') ?? '#64748B').trim() || '#64748B',
    icon: String(formData.get('icon') ?? 'Tag').trim() || 'Tag',
    sort_order: Number(formData.get('sort_order') ?? 0) || 0,
    active: String(formData.get('active') ?? '') === 'on',
  });
  await writeAudit({ actorId, action: 'category.save', entity: 'blog_categories', entityId: id });
  revalidatePath('/categories');
}

export async function toggleCategoryActiveAction(id: string, active: boolean): Promise<void> {
  const { actorId } = await assertAdmin();
  await setCategoryActive(id, active);
  await writeAudit({
    actorId,
    action: active ? 'category.activate' : 'category.deactivate',
    entity: 'blog_categories',
    entityId: id,
  });
  revalidatePath('/categories');
}
