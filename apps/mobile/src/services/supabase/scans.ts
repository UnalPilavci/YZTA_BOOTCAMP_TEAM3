import type {
  IngredientAnalysis,
  PersonalAlert,
  ScoreBreakdown,
} from '@/services/analysis/types';
import type { ScanRecord } from '@/store/scans';

import { supabase } from './client';

type ScanRow = {
  id: string;
  product_name: string | null;
  summary: string;
  health_score: number;
  ingredients: IngredientAnalysis[];
  personal_alerts: PersonalAlert[];
  score_breakdown: ScoreBreakdown;
  created_at: string;
  consumed: boolean;
};

const COLUMNS =
  'id, product_name, summary, health_score, ingredients, personal_alerts, score_breakdown, created_at, consumed';

function fromRow(row: ScanRow): ScanRecord {
  return {
    id: row.id,
    productName: row.product_name ?? undefined,
    summary: row.summary ?? '',
    healthScore: row.health_score,
    ingredients: row.ingredients ?? [],
    personalAlerts: row.personal_alerts ?? [],
    scoreBreakdown: row.score_breakdown ?? { processing: 0, additives: 0, nutrition: 0 },
    createdAt: Date.parse(row.created_at),
    syncedAt: Date.now(),
    consumed: row.consumed,
  };
}

export async function upsertScan(userId: string, rec: ScanRecord): Promise<void> {
  const { error } = await supabase.from('scans').upsert(
    {
      id: rec.id,
      user_id: userId,
      product_name: rec.productName ?? null,
      summary: rec.summary,
      health_score: rec.healthScore,
      ingredients: rec.ingredients,
      personal_alerts: rec.personalAlerts,
      score_breakdown: rec.scoreBreakdown,
      created_at: new Date(rec.createdAt).toISOString(),
      consumed: rec.consumed,
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
}

export async function fetchScans(userId: string, limit: number): Promise<ScanRecord[]> {
  const { data, error } = await supabase
    .from('scans')
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as ScanRow[] | null)?.map(fromRow) ?? [];
}

export async function deleteScan(id: string): Promise<void> {
  const { error } = await supabase.from('scans').delete().eq('id', id);
  if (error) throw error;
}
