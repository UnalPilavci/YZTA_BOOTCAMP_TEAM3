import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { MealResult } from '@/services/analysis/types';
import { deleteMeal, fetchMeals, upsertMeal } from '@/services/supabase/meals';
import { useAuth } from '@/store/auth';

export type MealRecord = MealResult & {
  id: string;
  createdAt: number;
  imageUri?: string;
  syncedAt?: number;
};

const MAX_MEALS = 200;

type MealsState = {
  meals: MealRecord[];
  ownerId: string | null;
  add: (result: MealResult, imageUri?: string) => MealRecord;
  remove: (id: string) => void;
  clear: () => void;
  syncFromServer: (userId: string) => Promise<void>;
};

export const useMeals = create<MealsState>()(
  persist(
    (set, get) => ({
      meals: [],
      ownerId: null,

      add: (result, imageUri) => {
        const record: MealRecord = {
          ...result,
          id: Crypto.randomUUID(),
          createdAt: Date.now(),
          imageUri,
          syncedAt: undefined,
        };
        set((state) => ({ meals: [record, ...state.meals].slice(0, MAX_MEALS) }));

        const userId = useAuth.getState().userId;
        if (userId) {
          void upsertMeal(userId, record)
            .then(() =>
              set((state) => ({
                meals: state.meals.map((m) =>
                  m.id === record.id ? { ...m, syncedAt: Date.now() } : m,
                ),
              })),
            )
            .catch(() => {});
        }
        return record;
      },

      remove: (id) => {
        set((state) => ({ meals: state.meals.filter((m) => m.id !== id) }));
        void deleteMeal(id).catch(() => {});
      },

      clear: () => set({ meals: [], ownerId: null }),

      syncFromServer: async (userId) => {
        if (get().ownerId && get().ownerId !== userId) {
          set({ meals: [], ownerId: userId });
        } else {
          set({ ownerId: userId });
        }

        for (const rec of get().meals.filter((m) => m.syncedAt == null)) {
          try {
            await upsertMeal(userId, rec);
            set((state) => ({
              meals: state.meals.map((m) =>
                m.id === rec.id ? { ...m, syncedAt: Date.now() } : m,
              ),
            }));
          } catch {
          }
        }

        let remote: MealRecord[];
        try {
          remote = await fetchMeals(userId, MAX_MEALS);
        } catch {
          return;
        }
        set((state) => {
          const byId = new Map<string, MealRecord>();
          for (const r of remote) byId.set(r.id, r);
          for (const local of state.meals) {
            if (!byId.has(local.id)) byId.set(local.id, local);
          }
          const merged = [...byId.values()]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, MAX_MEALS);
          return { meals: merged };
        });
      },
    }),
    {
      name: 'nutrilens-meals',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ meals: s.meals, ownerId: s.ownerId }),
    },
  ),
);

export function useMealsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useMeals.persist.hasHydrated());

  useEffect(() => {
    const unsub = useMeals.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useMeals.persist.hasHydrated());
    return unsub;
  }, []);

  return hydrated;
}
