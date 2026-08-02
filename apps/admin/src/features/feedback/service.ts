import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type FeedbackCategory = 'bug' | 'suggestion' | 'content' | 'other';

export type Feedback = {
  id: string;
  userId: string | null;
  authorName: string | null;
  category: FeedbackCategory;
  message: string;
  email: string | null;
  appVersion: string | null;
  createdAt: string;
};

type Row = {
  id: string;
  user_id: string | null;
  category: FeedbackCategory;
  message: string;
  email: string | null;
  app_version: string | null;
  created_at: string;
};

export async function listFeedback(): Promise<Feedback[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('feedback')
    .select('id, user_id, category, message, email, app_version, created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  const rows = (data as Row[] | null) ?? [];

  const names = new Map<string, string>();
  const ids = [...new Set(rows.map((r) => r.user_id).filter((v): v is string => !!v))];
  if (ids.length) {
    const { data: profs } = await supabase
      .from('discover_profiles')
      .select('id, display_name, username')
      .in('id', ids);
    for (const p of (profs as { id: string; display_name: string | null; username: string | null }[] | null) ??
      []) {
      names.set(p.id, p.display_name?.trim() || p.username || '(isimsiz)');
    }
  }

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    authorName: r.user_id ? (names.get(r.user_id) ?? '(isimsiz)') : null,
    category: r.category,
    message: r.message,
    email: r.email,
    appVersion: r.app_version,
    createdAt: r.created_at,
  }));
}

export async function feedbackCounts(): Promise<Record<FeedbackCategory, number> & { total: number }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('feedback').select('category');
  if (error) throw error;
  const rows = (data as { category: FeedbackCategory }[] | null) ?? [];
  const counts = { bug: 0, suggestion: 0, content: 0, other: 0, total: rows.length };
  for (const r of rows) counts[r.category] += 1;
  return counts;
}

export async function deleteFeedback(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('feedback').delete().eq('id', id);
  if (error) throw error;
}
