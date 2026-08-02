import { supabase } from './client';

export async function fetchSavedIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('saved_entries')
    .select('entry_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as { entry_id: string }[] | null) ?? []).map((r) => r.entry_id);
}

export async function setSavedEntry(
  userId: string,
  entryId: string,
  saved: boolean,
): Promise<void> {
  if (saved) {
    const { error } = await supabase
      .from('saved_entries')
      .upsert({ user_id: userId, entry_id: entryId }, { onConflict: 'user_id,entry_id' });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('saved_entries')
      .delete()
      .eq('user_id', userId)
      .eq('entry_id', entryId);
    if (error) throw error;
  }
}
