import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { fetchSavedIds, setSavedEntry } from '@/services/supabase/saved';
import { useAuth } from '@/store/auth';

type SavedState = {
  ids: string[];
  ownerId: string | null;
  isSaved: (entryId: string) => boolean;
  toggle: (entryId: string) => Promise<void>;
  loadFromServer: (userId: string) => Promise<void>;
  reset: () => void;
};

export const useSaved = create<SavedState>()(
  persist(
    (set, get) => ({
      ids: [],
      ownerId: null,

      isSaved: (entryId) => get().ids.includes(entryId),

      toggle: async (entryId) => {
        const userId = useAuth.getState().userId;
        if (!userId) return;
        const wasSaved = get().ids.includes(entryId);
        set((s) => ({
          ids: wasSaved ? s.ids.filter((x) => x !== entryId) : [entryId, ...s.ids],
        }));
        try {
          await setSavedEntry(userId, entryId, !wasSaved);
        } catch {
          set((s) => ({
            ids: wasSaved ? [entryId, ...s.ids.filter((x) => x !== entryId)] : s.ids.filter((x) => x !== entryId),
          }));
        }
      },

      loadFromServer: async (userId) => {
        if (get().ownerId && get().ownerId !== userId) set({ ids: [] });
        set({ ownerId: userId });
        try {
          set({ ids: await fetchSavedIds(userId), ownerId: userId });
        } catch {
        }
      },

      reset: () => set({ ids: [], ownerId: null }),
    }),
    {
      name: 'nutrilens-saved',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ ids: s.ids, ownerId: s.ownerId }),
    },
  ),
);
