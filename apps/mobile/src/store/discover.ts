import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  DiscoverError,
  fetchDiscoverProfile,
  saveDiscoverProfile,
  setAccountPrivacy,
  type DiscoverProfileInput,
} from '@/services/supabase/discover';
import { useAuth } from '@/store/auth';

export type { DiscoverProfileInput };

export type DiscoverStatus = 'unknown' | 'loading' | 'ready';

type DiscoverState = DiscoverProfileInput & {
  status: DiscoverStatus;
  ownerId: string | null;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isPrivate: boolean;
  pendingAvatarUri: string | null;
  setProfile: (input: DiscoverProfileInput) => Promise<void>;
  setPendingAvatar: (uri: string | null) => void;
  setPrivacy: (isPrivate: boolean) => Promise<void>;
  loadFromServer: (userId: string) => Promise<void>;
  reset: () => void;
};

const EMPTY = {
  displayName: '',
  username: '',
  bio: '',
  avatarUrl: '',
  followerCount: 0,
  followingCount: 0,
  postCount: 0,
  isPrivate: false,
  pendingAvatarUri: null as string | null,
};

export const useDiscoverProfile = create<DiscoverState>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      status: 'unknown' as DiscoverStatus,
      ownerId: null,

      setProfile: async ({ displayName, username, bio, avatarUrl }) => {
        const userId = useAuth.getState().userId;
        if (!userId) throw new DiscoverError('unknown', 'discover.saveFailed', 'no session');
        const snapshot = await saveDiscoverProfile(userId, {
          displayName: displayName.trim(),
          username: normalizeUsername(username),
          bio: bio.trim(),
          avatarUrl: avatarUrl.trim(),
        });
        set({ ...snapshot, ownerId: userId, status: 'ready' });
      },

      setPendingAvatar: (uri) => set({ pendingAvatarUri: uri }),

      setPrivacy: async (isPrivate) => {
        const userId = useAuth.getState().userId;
        if (!userId) throw new DiscoverError('unknown', 'discover.saveFailed', 'no session');
        const prev = get().isPrivate;
        set({ isPrivate });
        try {
          await setAccountPrivacy(userId, isPrivate);
        } catch (e) {
          set({ isPrivate: prev });
          throw e;
        }
      },

      loadFromServer: async (userId) => {
        if (get().ownerId && get().ownerId !== userId) {
          set({ ...EMPTY });
        }
        set({ status: 'loading', ownerId: userId });
        try {
          const remote = await fetchDiscoverProfile(userId);
          if (remote) set({ ...remote, ownerId: userId, status: 'ready' });
          else set({ status: 'ready' });
        } catch {
          set({ status: 'ready' });
        }
      },

      reset: () => set({ ...EMPTY, status: 'unknown', ownerId: null }),
    }),
    {
      name: 'nutrilens-discover',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        ownerId: s.ownerId,
        displayName: s.displayName,
        username: s.username,
        bio: s.bio,
        avatarUrl: s.avatarUrl,
        followerCount: s.followerCount,
        followingCount: s.followingCount,
        postCount: s.postCount,
        isPrivate: s.isPrivate,
        pendingAvatarUri: s.pendingAvatarUri,
      }),
    },
  ),
);

export function useDiscoverHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useDiscoverProfile.persist.hasHydrated());

  useEffect(() => {
    const unsub = useDiscoverProfile.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useDiscoverProfile.persist.hasHydrated());
    return unsub;
  }, []);

  return hydrated;
}

export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@+/, '').replace(/\s+/g, '').toLocaleLowerCase('tr');
}

export function resolveDisplayName(displayName: string, profileName: string, fallback: string): string {
  return displayName.trim() || profileName.trim() || fallback;
}

export function resolveUsername(username: string, displayName: string): string {
  if (username.trim()) return normalizeUsername(username);
  const derived = displayName
    .toLocaleLowerCase('tr')
    .replace(/[^a-zçğıöşü0-9]/g, '');
  return derived || 'nutrilens';
}
