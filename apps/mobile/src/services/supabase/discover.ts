import { supabase } from './client';

export type DiscoverErrorKind = 'usernameTaken' | 'usernameInvalid' | 'network' | 'unknown';

export class DiscoverError extends Error {
  constructor(
    readonly kind: DiscoverErrorKind,
    readonly messageKey: string,
    message?: string,
  ) {
    super(message ?? kind);
    this.name = 'DiscoverError';
  }
}

export type DiscoverSnapshot = {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isPrivate: boolean;
};

export type DiscoverProfileInput = {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
};

type DiscoverRow = {
  display_name: string;
  username: string | null;
  bio: string;
  avatar_url: string | null;
  follower_count: number;
  following_count: number;
  post_count: number;
  is_private: boolean | null;
};

const DISCOVER_COLUMNS =
  'display_name, username, bio, avatar_url, follower_count, following_count, post_count, is_private';

function fromRow(row: DiscoverRow): DiscoverSnapshot {
  return {
    displayName: row.display_name ?? '',
    username: row.username ?? '',
    bio: row.bio ?? '',
    avatarUrl: row.avatar_url ?? '',
    followerCount: row.follower_count ?? 0,
    followingCount: row.following_count ?? 0,
    postCount: row.post_count ?? 0,
    isPrivate: row.is_private ?? false,
  };
}

export async function setAccountPrivacy(userId: string, isPrivate: boolean): Promise<void> {
  const { error } = await supabase
    .from('discover_profiles')
    .update({ is_private: isPrivate })
    .eq('id', userId);
  if (error) throw error;
}

export async function fetchDiscoverProfile(userId: string): Promise<DiscoverSnapshot | null> {
  const { data, error } = await supabase
    .from('discover_profiles')
    .select(DISCOVER_COLUMNS)
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? fromRow(data as DiscoverRow) : null;
}

export async function saveDiscoverProfile(
  userId: string,
  input: DiscoverProfileInput,
): Promise<DiscoverSnapshot> {
  const { data, error } = await supabase
    .from('discover_profiles')
    .upsert(
      {
        id: userId,
        display_name: input.displayName,
        username: input.username.trim() ? input.username : null,
        bio: input.bio,
        avatar_url: input.avatarUrl.trim() ? input.avatarUrl : null,
      },
      { onConflict: 'id' },
    )
    .select(DISCOVER_COLUMNS)
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new DiscoverError('usernameTaken', 'discover.usernameTaken', error.message);
    }
    if (error.code === '23514') {
      throw new DiscoverError('usernameInvalid', 'discover.usernameInvalid', error.message);
    }
    throw new DiscoverError('unknown', 'discover.saveFailed', error.message);
  }
  return fromRow(data as DiscoverRow);
}
