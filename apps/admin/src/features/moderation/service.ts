import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type ModPost = {
  id: string;
  userId: string;
  authorName: string;
  productName: string;
  body: string;
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
};

export type ModComment = {
  id: string;
  userId: string;
  authorName: string;
  postId: string;
  body: string;
  createdAt: string;
};

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';
export type Report = {
  id: string;
  reporterId: string | null;
  reporterName: string;
  targetType: 'post' | 'comment' | 'user' | 'listing';
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
};

async function authorNames(ids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (ids.length === 0) return map;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('discover_profiles')
    .select('id, display_name, username')
    .in('id', [...new Set(ids)]);
  for (const d of (data as { id: string; display_name: string | null; username: string | null }[] | null) ?? []) {
    map.set(d.id, d.display_name?.trim() || d.username || '(isimsiz)');
  }
  return map;
}

export async function listPosts(limit = 100): Promise<ModPost[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('posts')
    .select('id, user_id, product_name, body, image_url, like_count, comment_count, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = data ?? [];
  const names = await authorNames(rows.map((r) => r.user_id));
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    authorName: names.get(r.user_id) ?? '(isimsiz)',
    productName: r.product_name,
    body: r.body,
    imageUrl: r.image_url,
    likeCount: r.like_count,
    commentCount: r.comment_count,
    createdAt: r.created_at,
  }));
}

export async function listComments(limit = 100): Promise<ModComment[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('post_comments')
    .select('id, user_id, post_id, body, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = data ?? [];
  const names = await authorNames(rows.map((r) => r.user_id));
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    authorName: names.get(r.user_id) ?? '(isimsiz)',
    postId: r.post_id,
    body: r.body,
    createdAt: r.created_at,
  }));
}

export async function listReports(status?: ReportStatus): Promise<Report[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from('content_reports')
    .select('id, reporter_id, target_type, target_id, reason, status, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  const rows = data ?? [];
  const names = await authorNames(rows.map((r) => r.reporter_id).filter(Boolean) as string[]);
  return rows.map((r) => ({
    id: r.id,
    reporterId: r.reporter_id,
    reporterName: r.reporter_id ? (names.get(r.reporter_id) ?? '(isimsiz)') : '(silinmiş)',
    targetType: r.target_type,
    targetId: r.target_id,
    reason: r.reason,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export async function deletePost(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteComment(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('post_comments').delete().eq('id', id);
  if (error) throw error;
}

export async function setReportStatus(id: string, status: ReportStatus): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('content_reports').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function countOpenReports(): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from('content_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open');
  return count ?? 0;
}
