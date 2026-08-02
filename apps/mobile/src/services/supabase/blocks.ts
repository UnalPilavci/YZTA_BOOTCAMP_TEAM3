import { supabase } from './client';

import type { UserListItem } from './posts';

type ProfileLite = { id: string; display_name: string | null; username: string | null; avatar_url: string | null };

export async function fetchBlockedIds(blockerId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('user_blocks')
    .select('blocked_id')
    .eq('blocker_id', blockerId);
  if (error) throw error;
  return new Set(((data as { blocked_id: string }[] | null) ?? []).map((r) => r.blocked_id));
}

export async function fetchBlockedUsers(blockerId: string, limit = 100): Promise<UserListItem[]> {
  const { data, error } = await supabase
    .from('user_blocks')
    .select('blocked_id, created_at')
    .eq('blocker_id', blockerId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  const ids = ((data as { blocked_id: string }[] | null) ?? []).map((r) => r.blocked_id);
  if (ids.length === 0) return [];

  const profiles = await supabase
    .from('discover_profiles')
    .select('id, display_name, username, avatar_url')
    .in('id', ids);
  if (profiles.error) throw profiles.error;
  const map = new Map<string, ProfileLite>();
  for (const p of (profiles.data as ProfileLite[] | null) ?? []) map.set(p.id, p);

  return ids
    .map((id) => map.get(id))
    .filter((p): p is ProfileLite => p != null)
    .map((p) => ({
      userId: p.id,
      name: p.display_name?.trim() || p.username || '',
      username: p.username ?? '',
      avatarUrl: p.avatar_url ?? null,
    }));
}

export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_blocks')
    .select('blocked_id')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .maybeSingle();
  if (error) throw error;
  return data != null;
}

export async function setBlock(
  blockerId: string,
  blockedId: string,
  block: boolean,
): Promise<void> {
  if (block) {
    const { error } = await supabase
      .from('user_blocks')
      .upsert(
        { blocker_id: blockerId, blocked_id: blockedId },
        { onConflict: 'blocker_id,blocked_id' },
      );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);
    if (error) throw error;
  }
}
