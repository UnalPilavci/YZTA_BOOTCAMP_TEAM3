import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  fetchExerciseCategories,
  fetchExercises,
  type ExerciseCategoryRow,
  type ExerciseRow,
} from '@/services/supabase/exercises';

type ExercisesState = {
  categories: ExerciseCategoryRow[];
  exercises: ExerciseRow[];
  syncedAt?: number;
  syncFromServer: () => Promise<void>;
};

export const useExercisesStore = create<ExercisesState>()(
  persist(
    (set) => ({
      categories: [],
      exercises: [],

      syncFromServer: async () => {
        try {
          const [categories, exercises] = await Promise.all([
            fetchExerciseCategories(),
            fetchExercises(),
          ]);
          if (categories.length === 0 && exercises.length === 0) return;
          set({ categories, exercises, syncedAt: Date.now() });
        } catch {
        }
      },
    }),
    {
      name: 'nutrilens-exercises',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        categories: s.categories,
        exercises: s.exercises,
        syncedAt: s.syncedAt,
      }),
    },
  ),
);

export function useExercisesHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useExercisesStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useExercisesStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useExercisesStore.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}
