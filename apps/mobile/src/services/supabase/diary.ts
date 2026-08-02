import type { DiaryEntry } from '@/store/diary';

import { supabase } from './client';

type DiaryRow = {
  id: string;
  logged_on: string;
  slot: DiaryEntry['slot'];
  name: string;
  quantity: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  source: DiaryEntry['source'];
  source_id: string | null;
  created_at: string;
};

const COLUMNS =
  'id, logged_on, slot, name, quantity, kcal, protein, carbs, fat, source, source_id, created_at';

function fromRow(row: DiaryRow): DiaryEntry {
  return {
    id: row.id,
    loggedOn: row.logged_on,
    slot: row.slot,
    name: row.name ?? '',
    quantity: row.quantity ?? 1,
    kcal: row.kcal ?? 0,
    protein: row.protein ?? 0,
    carbs: row.carbs ?? 0,
    fat: row.fat ?? 0,
    source: row.source ?? 'manual',
    sourceId: row.source_id ?? undefined,
    createdAt: Date.parse(row.created_at),
    syncedAt: Date.now(),
  };
}

export async function upsertDiaryEntry(userId: string, e: DiaryEntry): Promise<void> {
  const { error } = await supabase.from('diary_entries').upsert(
    {
      id: e.id,
      user_id: userId,
      logged_on: e.loggedOn,
      slot: e.slot,
      name: e.name,
      quantity: e.quantity,
      kcal: e.kcal,
      protein: e.protein,
      carbs: e.carbs,
      fat: e.fat,
      source: e.source,
      source_id: e.sourceId ?? null,
      created_at: new Date(e.createdAt).toISOString(),
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
}

export async function fetchDiaryEntries(userId: string, limit: number): Promise<DiaryEntry[]> {
  const { data, error } = await supabase
    .from('diary_entries')
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('logged_on', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as DiaryRow[] | null)?.map(fromRow) ?? [];
}

export async function deleteDiaryEntry(id: string): Promise<void> {
  const { error } = await supabase.from('diary_entries').delete().eq('id', id);
  if (error) throw error;
}
