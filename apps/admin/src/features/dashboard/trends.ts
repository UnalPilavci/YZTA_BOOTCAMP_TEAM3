import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type TrendPoint = { date: string; signups: number; scans: number; meals: number };

const DAY = 86_400_000;

export async function getDailyTrends(days = 30): Promise<TrendPoint[]> {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - days * DAY);
  const cutoffIso = cutoff.toISOString();

  const [profiles, scans, meals] = await Promise.all([
    supabase.from('profiles').select('created_at').gte('created_at', cutoffIso).limit(20000),
    supabase.from('scans').select('created_at').gte('created_at', cutoffIso).limit(20000),
    supabase.from('meals').select('created_at').gte('created_at', cutoffIso).limit(20000),
  ]);

  const buckets = new Map<string, TrendPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY);
    const key = dayKey(d);
    buckets.set(key, { date: key, signups: 0, scans: 0, meals: 0 });
  }

  const tally = (rows: { created_at: string }[] | null, field: keyof TrendPoint) => {
    for (const r of rows ?? []) {
      const key = dayKey(new Date(r.created_at));
      const b = buckets.get(key);
      if (b) (b[field] as number) += 1;
    }
  };
  tally(profiles.data as { created_at: string }[] | null, 'signups');
  tally(scans.data as { created_at: string }[] | null, 'scans');
  tally(meals.data as { created_at: string }[] | null, 'meals');

  return [...buckets.values()];
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
