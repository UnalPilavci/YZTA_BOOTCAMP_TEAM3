import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Language = 'tr' | 'en';
export type Units = 'metric' | 'imperial';

type SettingsState = {
  theme: ThemeMode;
  language: Language;
  notifications: boolean;
  dailyTip: boolean;
  units: Units;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setNotifications: (value: boolean) => void;
  setDailyTip: (value: boolean) => void;
  setUnits: (units: Units) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'tr',
      notifications: true,
      dailyTip: true,
      units: 'metric',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setNotifications: (notifications) => set({ notifications }),
      setDailyTip: (dailyTip) => set({ dailyTip }),
      setUnits: (units) => set({ units }),
    }),
    {
      name: 'nutrilens-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function useSettingsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useSettings.persist.hasHydrated());

  useEffect(() => {
    const unsub = useSettings.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useSettings.persist.hasHydrated());
    return unsub;
  }, []);

  return hydrated;
}
