import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type DashboardStats = {
  users: number;
  publishedArticles: number;
  totalArticles: number;
  posts: number;
  comments: number;
  meals: number;
  scans: number;
  listings: number;
  planDistribution: { free: number; premium: number; pro: number };
};

type Eq = { column: string; value: string | number | boolean };

async function countRows(
  supabase: ReturnType<typeof createAdminClient>,
  table: string,
  eq?: Eq,
): Promise<number> {
  const query = supabase.from(table).select('*', { count: 'exact', head: true });
  const { count, error } = await (eq ? query.eq(eq.column, eq.value) : query);
  if (error) {
    console.error(`[stats] ${table} sayılamadı:`, error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();

  const [users, publishedArticles, totalArticles, posts, comments, meals, scans, listings] =
    await Promise.all([
      countRows(supabase, 'profiles'),
      countRows(supabase, 'articles', { column: 'published', value: true }),
      countRows(supabase, 'articles'),
      countRows(supabase, 'posts'),
      countRows(supabase, 'post_comments'),
      countRows(supabase, 'meals'),
      countRows(supabase, 'scans'),
      countRows(supabase, 'trainer_listings'),
    ]);

  const [free, premium, pro] = await Promise.all([
    countRows(supabase, 'profiles', { column: 'plan', value: 'free' }),
    countRows(supabase, 'profiles', { column: 'plan', value: 'premium' }),
    countRows(supabase, 'profiles', { column: 'plan', value: 'pro' }),
  ]);

  return {
    users,
    publishedArticles,
    totalArticles,
    posts,
    comments,
    meals,
    scans,
    listings,
    planDistribution: { free, premium, pro },
  };
}
