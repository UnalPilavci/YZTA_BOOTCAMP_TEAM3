import { fetchBlockedIds } from './blocks';
import { supabase } from './client';

export type PostVisibility = 'public' | 'followers' | 'private';

export type NewPost = {
  scanId: string | null;
  productName: string;
  healthScore: number;
  kcal: number | null;
  iconKey: string;
  body: string;
  imageUrl?: string | null;
  visibility?: PostVisibility;
};

export type PostView = {
  id: string;
  userId: string;
  authorName: string;
  authorUsername: string;
  productName: string;
  healthScore: number;
  kcal: number | null;
  iconKey: string;
  body: string;
  likeCount: number;
  commentCount: number;
  createdAt: number;
  likedByMe: boolean;
  bookmarkedByMe: boolean;
  isMine: boolean;
  imageUrl: string | null;
  authorAvatarUrl: string | null;
  visibility: PostVisibility;
};

export type CommentView = {
  id: string;
  userId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  body: string;
  createdAt: number;
  isMine: boolean;
  parentId: string | null;
};

type PostRow = {
  id: string;
  user_id: string;
  product_name: string;
  health_score: number;
  kcal: number | null;
  icon_key: string;
  body: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  image_url: string | null;
  visibility: PostVisibility;
};

type ProfileLite = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

const POST_COLUMNS =
  'id, user_id, product_name, health_score, kcal, icon_key, body, like_count, comment_count, created_at, image_url, visibility';

async function fetchAuthors(userIds: string[]): Promise<Map<string, ProfileLite>> {
  const map = new Map<string, ProfileLite>();
  if (userIds.length === 0) return map;
  const { data, error } = await supabase
    .from('discover_profiles')
    .select('id, display_name, username, avatar_url')
    .in('id', userIds);
  if (error) throw error;
  for (const p of (data as ProfileLite[] | null) ?? []) map.set(p.id, p);
  return map;
}

function toView(
  row: PostRow,
  authors: Map<string, ProfileLite>,
  likedIds: Set<string>,
  bookmarkedIds: Set<string>,
  myId: string,
): PostView {
  const author = authors.get(row.user_id);
  return {
    id: row.id,
    userId: row.user_id,
    authorName: author?.display_name?.trim() || author?.username || '',
    authorUsername: author?.username ?? '',
    productName: row.product_name,
    healthScore: row.health_score,
    kcal: row.kcal,
    iconKey: row.icon_key,
    body: row.body,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    createdAt: Date.parse(row.created_at),
    likedByMe: likedIds.has(row.id),
    bookmarkedByMe: bookmarkedIds.has(row.id),
    isMine: row.user_id === myId,
    imageUrl: row.image_url,
    authorAvatarUrl: author?.avatar_url ?? null,
    visibility: row.visibility ?? 'public',
  };
}

async function fetchMyMarks(
  myId: string,
  postIds: string[],
): Promise<{ liked: Set<string>; bookmarked: Set<string> }> {
  const liked = new Set<string>();
  const bookmarked = new Set<string>();
  if (postIds.length === 0) return { liked, bookmarked };
  const [likes, bookmarks] = await Promise.all([
    supabase.from('post_likes').select('post_id').eq('user_id', myId).in('post_id', postIds),
    supabase.from('post_bookmarks').select('post_id').eq('user_id', myId).in('post_id', postIds),
  ]);
  if (likes.error) throw likes.error;
  if (bookmarks.error) throw bookmarks.error;
  for (const r of likes.data ?? []) liked.add((r as { post_id: string }).post_id);
  for (const r of bookmarks.data ?? []) bookmarked.add((r as { post_id: string }).post_id);
  return { liked, bookmarked };
}

async function enrich(rows: PostRow[], myId: string): Promise<PostView[]> {
  const authors = await fetchAuthors([...new Set(rows.map((r) => r.user_id))]);
  const { liked, bookmarked } = await fetchMyMarks(
    myId,
    rows.map((r) => r.id),
  );
  return rows.map((r) => toView(r, authors, liked, bookmarked, myId));
}

type JoinedPostRow = { posts: PostRow | null };

async function enrichJoined(rows: JoinedPostRow[], myId: string): Promise<PostView[]> {
  const posts = rows.map((r) => r.posts).filter((p): p is PostRow => p != null);
  return enrich(posts, myId);
}

export async function createPost(userId: string, input: NewPost): Promise<void> {
  const { error } = await supabase.from('posts').insert({
    user_id: userId,
    scan_id: input.scanId,
    product_name: input.productName,
    health_score: input.healthScore,
    kcal: input.kcal,
    icon_key: input.iconKey,
    body: input.body,
    image_url: input.imageUrl ?? null,
    visibility: input.visibility ?? 'public',
  });
  if (error) throw error;
}

export async function fetchFeed(myId: string, limit = 30): Promise<PostView[]> {
  const [rows, blocked] = await Promise.all([
    supabase
      .from('posts')
      .select(POST_COLUMNS)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(limit),
    fetchBlockedIds(myId),
  ]);
  if (rows.error) throw rows.error;
  const visible = ((rows.data as PostRow[] | null) ?? []).filter(
    (r) => !blocked.has(r.user_id),
  );
  return enrich(visible, myId);
}

export async function fetchLikedPosts(myId: string, limit = 60): Promise<PostView[]> {
  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id, created_at, posts!inner(' + POST_COLUMNS + ')')
    .eq('user_id', myId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return enrichJoined((data as unknown as JoinedPostRow[] | null) ?? [], myId);
}

export async function fetchBookmarkedPosts(myId: string, limit = 60): Promise<PostView[]> {
  const { data, error } = await supabase
    .from('post_bookmarks')
    .select('post_id, created_at, posts!inner(' + POST_COLUMNS + ')')
    .eq('user_id', myId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return enrichJoined((data as unknown as JoinedPostRow[] | null) ?? [], myId);
}

export async function fetchUserPosts(targetId: string, myId: string, limit = 60): Promise<PostView[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_COLUMNS)
    .eq('user_id', targetId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return enrich((data as PostRow[] | null) ?? [], myId);
}

export type PostEdit = {
  productName: string;
  body: string;
  imageUrl?: string | null;
  visibility?: PostVisibility;
};

export async function updatePost(postId: string, input: PostEdit): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .update({
      product_name: input.productName,
      body: input.body,
      image_url: input.imageUrl ?? null,
      ...(input.visibility ? { visibility: input.visibility } : {}),
    })
    .eq('id', postId);
  if (error) throw error;
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}

export async function setLike(postId: string, userId: string, liked: boolean): Promise<void> {
  if (liked) {
    const { error } = await supabase
      .from('post_likes')
      .upsert({ post_id: postId, user_id: userId }, { onConflict: 'post_id,user_id' });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw error;
  }
}

export async function setBookmark(postId: string, userId: string, saved: boolean): Promise<void> {
  if (saved) {
    const { error } = await supabase
      .from('post_bookmarks')
      .upsert({ post_id: postId, user_id: userId }, { onConflict: 'post_id,user_id' });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('post_bookmarks')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw error;
  }
}

type CommentRow = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  parent_id: string | null;
};

export async function fetchComments(postId: string, myId: string): Promise<CommentView[]> {
  const { data, error } = await supabase
    .from('post_comments')
    .select('id, user_id, body, created_at, parent_id')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  const blocked = await fetchBlockedIds(myId);
  const rows = ((data as CommentRow[] | null) ?? []).filter((r) => !blocked.has(r.user_id));
  const authors = await fetchAuthors([...new Set(rows.map((r) => r.user_id))]);
  return rows.map((r) => {
    const a = authors.get(r.user_id);
    return {
      id: r.id,
      userId: r.user_id,
      authorName: a?.display_name?.trim() || a?.username || '',
      authorUsername: a?.username ?? '',
      authorAvatarUrl: a?.avatar_url ?? null,
      body: r.body,
      createdAt: Date.parse(r.created_at),
      isMine: r.user_id === myId,
      parentId: r.parent_id,
    };
  });
}

export type MyCommentView = {
  id: string;
  postId: string;
  body: string;
  createdAt: number;
  postProductName: string;
  postHealthScore: number;
};

type MyCommentRow = {
  id: string;
  post_id: string;
  body: string;
  created_at: string;
  posts: { product_name: string; health_score: number } | null;
};

export async function fetchMyComments(myId: string, limit = 60): Promise<MyCommentView[]> {
  const { data, error } = await supabase
    .from('post_comments')
    .select('id, post_id, body, created_at, posts!inner(product_name, health_score)')
    .eq('user_id', myId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data as unknown as MyCommentRow[] | null) ?? []).map((r) => ({
    id: r.id,
    postId: r.post_id,
    body: r.body,
    createdAt: Date.parse(r.created_at),
    postProductName: r.posts?.product_name ?? '',
    postHealthScore: r.posts?.health_score ?? 0,
  }));
}

export async function addComment(
  postId: string,
  userId: string,
  body: string,
  parentId?: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, user_id: userId, body: body.trim(), parent_id: parentId ?? null });
  if (error) throw error;
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('post_comments').delete().eq('id', id);
  if (error) throw error;
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  if (error) throw error;
  return data != null;
}

export type UserListItem = {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
};

function toUserListItem(p: ProfileLite): UserListItem {
  return {
    userId: p.id,
    name: p.display_name?.trim() || p.username || '',
    username: p.username ?? '',
    avatarUrl: p.avatar_url ?? null,
  };
}

export async function fetchFollowList(
  targetId: string,
  mode: 'followers' | 'following',
  limit = 100,
): Promise<UserListItem[]> {
  const selectCol = mode === 'followers' ? 'follower_id' : 'following_id';
  const matchCol = mode === 'followers' ? 'following_id' : 'follower_id';
  const { data, error } = await supabase
    .from('follows')
    .select(selectCol)
    .eq(matchCol, targetId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  const ids = ((data as Record<string, string>[] | null) ?? []).map((r) => r[selectCol]);
  const authors = await fetchAuthors(ids);
  return ids.map((id) => authors.get(id)).filter((p): p is ProfileLite => p != null).map(toUserListItem);
}

export async function setFollow(
  followerId: string,
  followingId: string,
  follow: boolean,
): Promise<void> {
  if (follow) {
    const { error } = await supabase
      .from('follows')
      .upsert(
        { follower_id: followerId, following_id: followingId },
        { onConflict: 'follower_id,following_id' },
      );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    if (error) throw error;
  }
}

function sanitizeQuery(q: string): string {
  return q.replace(/[,%()*\\]/g, '').trim();
}

export async function searchProfiles(q: string, limit = 20): Promise<UserListItem[]> {
  const s = sanitizeQuery(q);
  if (s.length < 2) return [];
  const { data, error } = await supabase
    .from('discover_profiles')
    .select('id, display_name, username, avatar_url')
    .or(`username.ilike.%${s}%,display_name.ilike.%${s}%`)
    .limit(limit);
  if (error) throw error;
  return ((data as ProfileLite[] | null) ?? []).map(toUserListItem);
}

export async function searchPosts(q: string, myId: string, limit = 20): Promise<PostView[]> {
  const s = sanitizeQuery(q);
  if (s.length < 2) return [];
  const { data, error } = await supabase
    .from('posts')
    .select(POST_COLUMNS)
    .eq('visibility', 'public')
    .or(`product_name.ilike.%${s}%,body.ilike.%${s}%`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return enrich((data as PostRow[] | null) ?? [], myId);
}

export type FollowState = 'none' | 'requested' | 'following';

export async function fetchFollowState(myId: string, targetId: string): Promise<FollowState> {
  const [f, r] = await Promise.all([
    supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', myId)
      .eq('following_id', targetId)
      .maybeSingle(),
    supabase
      .from('follow_requests')
      .select('requester_id')
      .eq('requester_id', myId)
      .eq('target_id', targetId)
      .maybeSingle(),
  ]);
  if (f.error) throw f.error;
  if (r.error) throw r.error;
  if (f.data) return 'following';
  if (r.data) return 'requested';
  return 'none';
}

export async function requestFollow(myId: string, targetId: string): Promise<void> {
  const { error } = await supabase
    .from('follow_requests')
    .upsert({ requester_id: myId, target_id: targetId }, { onConflict: 'requester_id,target_id' });
  if (error) throw error;
}

export async function cancelFollowRequest(myId: string, targetId: string): Promise<void> {
  const { error } = await supabase
    .from('follow_requests')
    .delete()
    .eq('requester_id', myId)
    .eq('target_id', targetId);
  if (error) throw error;
}

export type IncomingRequest = UserListItem & { createdAt: number };

export async function fetchIncomingRequests(myId: string, limit = 100): Promise<IncomingRequest[]> {
  const { data, error } = await supabase
    .from('follow_requests')
    .select('requester_id, created_at')
    .eq('target_id', myId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = (data as { requester_id: string; created_at: string }[] | null) ?? [];
  const authors = await fetchAuthors([...new Set(rows.map((r) => r.requester_id))]);
  return rows
    .map((r) => {
      const p = authors.get(r.requester_id);
      if (!p) return null;
      return { ...toUserListItem(p), createdAt: Date.parse(r.created_at) };
    })
    .filter((x): x is IncomingRequest => x != null);
}

export async function countIncomingRequests(myId: string): Promise<number> {
  const { count, error } = await supabase
    .from('follow_requests')
    .select('*', { count: 'exact', head: true })
    .eq('target_id', myId);
  if (error) throw error;
  return count ?? 0;
}

export async function approveFollowRequest(requesterId: string): Promise<void> {
  const { error } = await supabase.rpc('approve_follow_request', { p_requester: requesterId });
  if (error) throw error;
}

export async function rejectFollowRequest(myId: string, requesterId: string): Promise<void> {
  const { error } = await supabase
    .from('follow_requests')
    .delete()
    .eq('requester_id', requesterId)
    .eq('target_id', myId);
  if (error) throw error;
}

export async function followOrRequest(myId: string, targetId: string): Promise<FollowState> {
  const { data } = await supabase
    .from('discover_profiles')
    .select('is_private')
    .eq('id', targetId)
    .maybeSingle();
  const priv = (data as { is_private: boolean | null } | null)?.is_private ?? false;
  if (priv) {
    await requestFollow(myId, targetId);
    return 'requested';
  }
  await setFollow(myId, targetId, true);
  return 'following';
}

export async function fetchMyFollowingIds(myId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', myId);
  if (error) throw error;
  return new Set(((data as { following_id: string }[] | null) ?? []).map((r) => r.following_id));
}

export async function fetchMyRequestedIds(myId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('follow_requests')
    .select('target_id')
    .eq('requester_id', myId);
  if (error) throw error;
  return new Set(((data as { target_id: string }[] | null) ?? []).map((r) => r.target_id));
}
