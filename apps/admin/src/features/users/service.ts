import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type PlanId = 'free' | 'premium' | 'pro';

export type UserRow = {
  id: string;
  email: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  banned: boolean;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  plan: PlanId;
  isTrainer: boolean;
  isAdmin: boolean;
  isBlogger: boolean;
};

export type UserDetail = UserRow & {
  bio: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  scanCount: number;
  mealCount: number;
};

type ProfileLite = {
  id: string;
  plan: PlanId;
  is_trainer: boolean;
  is_admin: boolean;
  is_blogger: boolean;
};
type DiscoverLite = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  follower_count: number;
  following_count: number;
  post_count: number;
};

function isBanned(user: { banned_until?: string | null }): boolean {
  const until = user.banned_until;
  return !!until && new Date(until).getTime() > Date.now();
}

export async function listUsers(search?: string): Promise<UserRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  let users = data.users;
  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    users = users.filter((u) => (u.email ?? '').toLowerCase().includes(q));
  }
  const ids = users.map((u) => u.id);
  const { profiles, discover } = await fetchSideTables(ids);

  return users.map((u) => {
    const p = profiles.get(u.id);
    const d = discover.get(u.id);
    return {
      id: u.id,
      email: u.email ?? null,
      createdAt: u.created_at ?? null,
      lastSignInAt: u.last_sign_in_at ?? null,
      banned: isBanned(u as { banned_until?: string | null }),
      displayName: d?.display_name?.trim() || d?.username || '',
      username: d?.username ?? '',
      avatarUrl: d?.avatar_url ?? null,
      plan: p?.plan ?? 'free',
      isTrainer: p?.is_trainer ?? false,
      isAdmin: p?.is_admin ?? false,
      isBlogger: p?.is_blogger ?? false,
    };
  });
}

export async function getUserDetail(id: string): Promise<UserDetail | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.getUserById(id);
  if (error || !data.user) return null;
  const u = data.user;
  const { profiles, discover } = await fetchSideTables([id]);
  const p = profiles.get(id);
  const d = discover.get(id);

  const [scanCount, mealCount] = await Promise.all([
    countOwned(supabase, 'scans', id),
    countOwned(supabase, 'meals', id),
  ]);

  return {
    id,
    email: u.email ?? null,
    createdAt: u.created_at ?? null,
    lastSignInAt: u.last_sign_in_at ?? null,
    banned: isBanned(u as { banned_until?: string | null }),
    displayName: d?.display_name?.trim() || d?.username || '',
    username: d?.username ?? '',
    avatarUrl: d?.avatar_url ?? null,
    bio: d?.bio ?? '',
    plan: p?.plan ?? 'free',
    isTrainer: p?.is_trainer ?? false,
    isAdmin: p?.is_admin ?? false,
    isBlogger: p?.is_blogger ?? false,
    followerCount: d?.follower_count ?? 0,
    followingCount: d?.following_count ?? 0,
    postCount: d?.post_count ?? 0,
    scanCount,
    mealCount,
  };
}

async function fetchSideTables(ids: string[]) {
  const supabase = createAdminClient();
  const profiles = new Map<string, ProfileLite>();
  const discover = new Map<string, DiscoverLite>();
  if (ids.length === 0) return { profiles, discover };

  const [pRes, dRes] = await Promise.all([
    supabase.from('profiles').select('id, plan, is_trainer, is_admin, is_blogger').in('id', ids),
    supabase
      .from('discover_profiles')
      .select('id, display_name, username, avatar_url, bio, follower_count, following_count, post_count')
      .in('id', ids),
  ]);
  for (const p of (pRes.data as ProfileLite[] | null) ?? []) profiles.set(p.id, p);
  for (const d of (dRes.data as DiscoverLite[] | null) ?? []) discover.set(d.id, d);
  return { profiles, discover };
}

async function countOwned(
  supabase: ReturnType<typeof createAdminClient>,
  table: string,
  userId: string,
): Promise<number> {
  const { count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count ?? 0;
}

async function updateProfile(id: string, patch: Record<string, unknown>) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  if (error) throw error;
}

export const setPlan = (id: string, plan: PlanId) => updateProfile(id, { plan });
export const setTrainer = (id: string, isTrainer: boolean) =>
  updateProfile(id, { is_trainer: isTrainer });
export const setAdmin = (id: string, isAdmin: boolean) => updateProfile(id, { is_admin: isAdmin });
export const setBlogger = (id: string, isBlogger: boolean) =>
  updateProfile(id, { is_blogger: isBlogger });

export async function setBanned(id: string, banned: boolean): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(id, {
    ban_duration: banned ? '876000h' : 'none',
  });
  if (error) throw error;
}

export async function deleteUser(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) throw error;
}
