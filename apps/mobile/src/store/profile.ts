import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { PlanId } from '@/data/plans';
import {
  computeTargets,
  type ActivityLevel,
  type Goal,
  type MacroTargets,
  type Sex,
} from '@/data/nutrition-targets';
import { fetchProfile, saveProfile, type ProfileSnapshot } from '@/services/supabase/profile';

export type ProfileCategory =
  | 'allergens'
  | 'sensitivities'
  | 'diets'
  | 'conditions';

export type AccountInput = {
  email: string;
  phone: string;
  heightCm: string;
  weightKg: string;
};

export const CUSTOM_PREFIX = 'custom:';

export type ProfileStatus = 'unknown' | 'loading' | 'ready';

type ProfileState = {
  status: ProfileStatus;
  ownerId: string | null;
  completed: boolean;
  name: string;
  email: string;
  phone: string;
  heightCm: string;
  weightKg: string;
  waistCm: string;
  hipCm: string;
  neckCm: string;
  chestCm: string;
  armCm: string;
  thighCm: string;
  allergens: string[];
  sensitivities: string[];
  diets: string[];
  conditions: string[];
  isTrainer: boolean;
  plan: PlanId;
  goal: Goal | null;
  activityLevel: ActivityLevel | null;
  sex: Sex | null;
  birthDate: string | null;
  targetWeightKg: string;
  favoriteExercises: string[];
  setName: (name: string) => void;
  setAccount: (account: AccountInput) => void;
  setCategory: (category: ProfileCategory, ids: string[]) => void;
  setBody: (
    m: Partial<
      Pick<
        ProfileState,
        'heightCm' | 'weightKg' | 'waistCm' | 'hipCm' | 'neckCm' | 'chestCm' | 'armCm' | 'thighCm'
      >
    >,
  ) => void;
  setGoalInfo: (input: {
    goal?: Goal | null;
    activityLevel?: ActivityLevel | null;
    sex?: Sex | null;
    birthDate?: string | null;
    targetWeightKg?: string;
  }) => void;
  setIsTrainer: (v: boolean) => void;
  setPlan: (plan: PlanId) => void;
  toggleFavoriteExercise: (id: string) => void;
  toggle: (category: ProfileCategory, id: string) => void;
  addCustomAllergen: (label: string) => void;
  isSelected: (category: ProfileCategory, id: string) => boolean;
  complete: () => void;
  reset: () => void;
  loadFromServer: (userId: string, email: string) => Promise<void>;
  saveToServer: (userId: string) => Promise<void>;
};

const EMPTY = {
  completed: false,
  name: '',
  email: '',
  phone: '',
  heightCm: '',
  weightKg: '',
  waistCm: '',
  hipCm: '',
  neckCm: '',
  chestCm: '',
  armCm: '',
  thighCm: '',
  allergens: [] as string[],
  sensitivities: [] as string[],
  diets: [] as string[],
  conditions: [] as string[],
  isTrainer: false,
  plan: 'free' as PlanId,
  favoriteExercises: [] as string[],
  goal: null as Goal | null,
  activityLevel: null as ActivityLevel | null,
  sex: null as Sex | null,
  birthDate: null as string | null,
  targetWeightKg: '',
};

function snapshotOf(s: ProfileState): ProfileSnapshot {
  return {
    completed: s.completed,
    name: s.name,
    phone: s.phone,
    heightCm: s.heightCm,
    weightKg: s.weightKg,
    waistCm: s.waistCm,
    hipCm: s.hipCm,
    neckCm: s.neckCm,
    chestCm: s.chestCm,
    armCm: s.armCm,
    thighCm: s.thighCm,
    allergens: s.allergens,
    sensitivities: s.sensitivities,
    diets: s.diets,
    conditions: s.conditions,
    isTrainer: s.isTrainer,
    plan: s.plan,
    goal: s.goal,
    activityLevel: s.activityLevel,
    sex: s.sex,
    birthDate: s.birthDate,
    targetWeightKg: s.targetWeightKg,
  };
}

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      status: 'unknown' as ProfileStatus,
      ownerId: null,

      setName: (name) => set({ name }),

      setAccount: ({ email, phone, heightCm, weightKg }) =>
        set({
          email,
          phone,
          heightCm,
          weightKg,
          name: email.includes('@') ? email.split('@')[0] : email,
        }),

      setCategory: (category, ids) => set({ [category]: ids } as Partial<ProfileState>),

      setBody: (m) => set((state) => ({ ...state, ...m })),

      setGoalInfo: (input) => set((state) => ({ ...state, ...input })),

      setIsTrainer: (v) => set({ isTrainer: v }),

      setPlan: (plan) =>
        set((state) => ({ plan, isTrainer: plan === 'pro' ? true : state.isTrainer })),

      toggleFavoriteExercise: (id) =>
        set((state) => ({
          favoriteExercises: state.favoriteExercises.includes(id)
            ? state.favoriteExercises.filter((x) => x !== id)
            : [...state.favoriteExercises, id],
        })),

      toggle: (category, id) =>
        set((state) => {
          const current = state[category];
          const next = current.includes(id)
            ? current.filter((x) => x !== id)
            : [...current, id];
          return { [category]: next } as Partial<ProfileState>;
        }),

      addCustomAllergen: (label) =>
        set((state) => {
          const id = `${CUSTOM_PREFIX}${label.trim()}`;
          if (!label.trim() || state.allergens.includes(id)) return state;
          return { allergens: [...state.allergens, id] };
        }),

      isSelected: (category, id) => get()[category].includes(id),

      complete: () => set({ completed: true }),

      reset: () => set({ ...EMPTY, status: 'unknown', ownerId: null }),

      loadFromServer: async (userId, email) => {
        if (get().ownerId && get().ownerId !== userId) {
          set({ ...EMPTY });
        }
        set({ status: 'loading', ownerId: userId, email });
        try {
          const remote = await fetchProfile(userId);
          if (remote) {
            set({ ...remote, email, ownerId: userId, status: 'ready' });
          } else {
            set({ status: 'ready' });
          }
        } catch {
          set({ status: 'ready' });
        }
      },

      saveToServer: async (userId) => {
        await saveProfile(userId, snapshotOf(get()));
      },
    }),
    {
      name: 'nutrilens-profile',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        ownerId: s.ownerId,
        completed: s.completed,
        name: s.name,
        email: s.email,
        phone: s.phone,
        heightCm: s.heightCm,
        weightKg: s.weightKg,
        waistCm: s.waistCm,
        hipCm: s.hipCm,
        neckCm: s.neckCm,
        chestCm: s.chestCm,
        armCm: s.armCm,
        thighCm: s.thighCm,
        allergens: s.allergens,
        sensitivities: s.sensitivities,
        diets: s.diets,
        conditions: s.conditions,
        isTrainer: s.isTrainer,
        plan: s.plan,
        favoriteExercises: s.favoriteExercises,
        goal: s.goal,
        activityLevel: s.activityLevel,
        sex: s.sex,
        birthDate: s.birthDate,
        targetWeightKg: s.targetWeightKg,
      }),
    },
  ),
);

export function useProfileHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useProfile.persist.hasHydrated());

  useEffect(() => {
    const unsub = useProfile.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useProfile.persist.hasHydrated());
    return unsub;
  }, []);

  return hydrated;
}

export function useDailyTargets(): MacroTargets | null {
  const goal = useProfile((s) => s.goal);
  const activityLevel = useProfile((s) => s.activityLevel);
  const sex = useProfile((s) => s.sex);
  const birthDate = useProfile((s) => s.birthDate);
  const heightCm = useProfile((s) => s.heightCm);
  const weightKg = useProfile((s) => s.weightKg);

  if (!goal || !activityLevel || !sex || !birthDate) return null;
  const birthYear = Number.parseInt(birthDate.slice(0, 4), 10);
  if (!Number.isFinite(birthYear)) return null;
  const h = Number.parseInt(heightCm, 10);
  const w = Number.parseInt(weightKg, 10);
  if (!Number.isFinite(h) || !Number.isFinite(w)) return null;

  return computeTargets({
    sex,
    birthYear,
    heightCm: h,
    weightKg: w,
    activity: activityLevel,
    goal,
  });
}

export function allergenLabel(
  id: string,
  t: (key: string) => string,
): string {
  return id.startsWith(CUSTOM_PREFIX)
    ? id.slice(CUSTOM_PREFIX.length)
    : t(`options.allergens.${id}`);
}
