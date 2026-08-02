import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type BlogCategory = {
  id: string;
  label_tr: string;
  label_en: string;
  color: string;
  icon: string;
  sort_order: number;
  active: boolean;
};

export type CategoryInput = Omit<BlogCategory, 'sort_order' | 'active'> & {
  sort_order: number;
  active: boolean;
};

export async function listCategories(): Promise<BlogCategory[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as BlogCategory[];
}

export async function upsertCategory(input: CategoryInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('blog_categories').upsert(
    {
      id: input.id,
      label_tr: input.label_tr,
      label_en: input.label_en,
      color: input.color,
      icon: input.icon,
      sort_order: input.sort_order,
      active: input.active,
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
}

export async function setCategoryActive(id: string, active: boolean): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('blog_categories').update({ active }).eq('id', id);
  if (error) throw error;
}
