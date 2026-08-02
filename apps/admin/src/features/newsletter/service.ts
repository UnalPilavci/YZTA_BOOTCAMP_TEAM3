import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type NewsletterTopic = 'recipes' | 'tips' | 'contests' | 'features';

export type Subscriber = {
  userId: string;
  name: string;
  email: string;
  subscribed: boolean;
  topics: NewsletterTopic[];
  createdAt: string;
  updatedAt: string;
};

type Row = {
  user_id: string;
  email: string;
  subscribed: boolean;
  topics: NewsletterTopic[];
  created_at: string;
  updated_at: string;
};

export async function listSubscribers(): Promise<Subscriber[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('user_id, email, subscribed, topics, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(1000);
  if (error) throw error;
  const rows = (data as Row[] | null) ?? [];

  const names = new Map<string, string>();
  const ids = [...new Set(rows.map((r) => r.user_id))];
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
    userId: r.user_id,
    name: names.get(r.user_id) ?? '(isimsiz)',
    email: r.email,
    subscribed: r.subscribed,
    topics: r.topics ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function subscriberStats(): Promise<{ total: number; active: number }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('newsletter_subscribers').select('subscribed');
  if (error) throw error;
  const rows = (data as { subscribed: boolean }[] | null) ?? [];
  return { total: rows.length, active: rows.filter((r) => r.subscribed).length };
}
