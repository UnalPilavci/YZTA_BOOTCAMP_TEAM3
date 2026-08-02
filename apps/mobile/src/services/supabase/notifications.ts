import { supabase } from './client';

export type NotificationType = 'like' | 'comment' | 'follow' | 'follow_accept' | 'follow_request';

export type NotifActor = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
};

export type NotificationGroup = {
  key: string;
  type: NotificationType;
  actors: NotifActor[];
  totalActors: number;
  createdAt: number;
  unread: boolean;
  postId: string | null;
  postImageUrl: string | null;
  productName: string | null;
};

type NotifRow = {
  id: string;
  actor_id: string;
  type: NotificationType;
  post_id: string | null;
  comment_id: string | null;
  read: boolean;
  created_at: string;
};

type ActorRow = { id: string; display_name: string | null; username: string | null; avatar_url: string | null };
type PostLite = { id: string; product_name: string; image_url: string | null };

function groupKey(row: NotifRow): string {
  switch (row.type) {
    case 'like':
    case 'comment':
      return `${row.type}:${row.post_id}`;
    case 'follow':
    case 'follow_request':
      return row.type;
    case 'follow_accept':
      return `follow_accept:${row.actor_id}`;
  }
}

export async function fetchNotifications(myId: string, limit = 120): Promise<NotificationGroup[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, actor_id, type, post_id, comment_id, read, created_at')
    .eq('user_id', myId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = (data as NotifRow[] | null) ?? [];
  if (rows.length === 0) return [];

  const actorIds = [...new Set(rows.map((r) => r.actor_id))];
  const postIds = [...new Set(rows.map((r) => r.post_id).filter((x): x is string => !!x))];
  const [actorsRes, postsRes] = await Promise.all([
    supabase.from('discover_profiles').select('id, display_name, username, avatar_url').in('id', actorIds),
    postIds.length
      ? supabase.from('posts').select('id, product_name, image_url').in('id', postIds)
      : Promise.resolve({ data: [] as PostLite[], error: null }),
  ]);
  const actors = new Map<string, ActorRow>();
  for (const a of (actorsRes.data as ActorRow[] | null) ?? []) actors.set(a.id, a);
  const posts = new Map<string, PostLite>();
  for (const p of (postsRes.data as PostLite[] | null) ?? []) posts.set(p.id, p);

  const toActor = (id: string): NotifActor => {
    const a = actors.get(id);
    return {
      id,
      name: a?.display_name?.trim() || a?.username || '',
      username: a?.username ?? '',
      avatarUrl: a?.avatar_url ?? null,
    };
  };

  const map = new Map<string, NotificationGroup>();
  for (const row of rows) {
    const key = groupKey(row);
    const existing = map.get(key);
    if (existing) {
      if (!existing.actors.some((x) => x.id === row.actor_id)) {
        existing.actors.push(toActor(row.actor_id));
        existing.totalActors += 1;
      }
      if (!row.read) existing.unread = true;
      continue;
    }
    const post = row.post_id ? posts.get(row.post_id) : undefined;
    map.set(key, {
      key,
      type: row.type,
      actors: [toActor(row.actor_id)],
      totalActors: 1,
      createdAt: Date.parse(row.created_at),
      unread: !row.read,
      postId: row.post_id,
      postImageUrl: post?.image_url ?? null,
      productName: post?.product_name ?? null,
    });
  }
  return [...map.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export async function countUnreadNotifications(myId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', myId)
    .eq('read', false);
  if (error) throw error;
  return count ?? 0;
}

export async function markNotificationsRead(myId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', myId)
    .eq('read', false);
  if (error) throw error;
}
