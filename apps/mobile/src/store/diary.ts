import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { DiarySlot } from '@/data/diary-slots';
import { deleteDiaryEntry, fetchDiaryEntries, upsertDiaryEntry } from '@/services/supabase/diary';
import { useAuth } from '@/store/auth';

export type { DiarySlot } from '@/data/diary-slots';

export type DiaryEntry = {
  id: string;
  loggedOn: string;
  slot: DiarySlot;
  name: string;
  quantity: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  source: 'manual' | 'meal';
  sourceId?: string;
  createdAt: number;
  syncedAt?: number;
};

export type NewDiaryEntry = Omit<DiaryEntry, 'id' | 'createdAt' | 'syncedAt'>;

const MAX_ENTRIES = 500;

export function dateKeyOf(ms: number): string {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function entryTotals(e: DiaryEntry): { kcal: number; protein: number; carbs: number; fat: number } {
  return {
    kcal: Math.round(e.kcal * e.quantity),
    protein: Math.round(e.protein * e.quantity),
    carbs: Math.round(e.carbs * e.quantity),
    fat: Math.round(e.fat * e.quantity),
  };
}

type DiaryState = {
  entries: DiaryEntry[];
  ownerId: string | null;
  add: (input: NewDiaryEntry) => DiaryEntry;
  update: (id: string, patch: Partial<NewDiaryEntry>) => void;
  remove: (id: string) => void;
  clear: () => void;
  syncFromServer: (userId: string) => Promise<void>;
};

function pushToServer(entry: DiaryEntry, set: (fn: (s: DiaryState) => Partial<DiaryState>) => void): void {
  const userId = useAuth.getState().userId;
  if (!userId) return;
  void upsertDiaryEntry(userId, entry)
    .then(() =>
      set((state) => ({
        entries: state.entries.map((m) => (m.id === entry.id ? { ...m, syncedAt: Date.now() } : m)),
      })),
    )
    .catch(() => {});
}

export const useDiary = create<DiaryState>()(
  persist(
    (set, get) => ({
      entries: [],
      ownerId: null,

      add: (input) => {
        const record: DiaryEntry = {
          ...input,
          id: Crypto.randomUUID(),
          createdAt: Date.now(),
          syncedAt: undefined,
        };
        set((state) => ({ entries: [record, ...state.entries].slice(0, MAX_ENTRIES) }));
        pushToServer(record, set);
        return record;
      },

      update: (id, patch) => {
        let updated: DiaryEntry | undefined;
        set((state) => ({
          entries: state.entries.map((m) => {
            if (m.id !== id) return m;
            updated = { ...m, ...patch, syncedAt: undefined };
            return updated;
          }),
        }));
        if (updated) pushToServer(updated, set);
      },

      remove: (id) => {
        set((state) => ({ entries: state.entries.filter((m) => m.id !== id) }));
        void deleteDiaryEntry(id).catch(() => {});
      },

      clear: () => set({ entries: [], ownerId: null }),

      syncFromServer: async (userId) => {
        if (get().ownerId && get().ownerId !== userId) {
          set({ entries: [], ownerId: userId });
        } else {
          set({ ownerId: userId });
        }

        for (const rec of get().entries.filter((m) => m.syncedAt == null)) {
          try {
            await upsertDiaryEntry(userId, rec);
            set((state) => ({
              entries: state.entries.map((m) => (m.id === rec.id ? { ...m, syncedAt: Date.now() } : m)),
            }));
          } catch {
          }
        }

        let remote: DiaryEntry[];
        try {
          remote = await fetchDiaryEntries(userId, MAX_ENTRIES);
        } catch {
          return;
        }
        set((state) => {
          const byId = new Map<string, DiaryEntry>();
          for (const r of remote) byId.set(r.id, r);
          for (const local of state.entries) {
            if (local.syncedAt == null || !byId.has(local.id)) byId.set(local.id, local);
          }
          const merged = [...byId.values()]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, MAX_ENTRIES);
          return { entries: merged };
        });
      },
    }),
    {
      name: 'nutrilens-diary',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ entries: s.entries, ownerId: s.ownerId }),
    },
  ),
);

export function useDiaryHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useDiary.persist.hasHydrated());

  useEffect(() => {
    const unsub = useDiary.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useDiary.persist.hasHydrated());
    return unsub;
  }, []);

  return hydrated;
}
