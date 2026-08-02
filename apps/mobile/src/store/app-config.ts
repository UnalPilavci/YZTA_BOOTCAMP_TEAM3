import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { EMPTY_CONFIG, fetchAppConfig, type AppConfig } from '@/services/supabase/app-config';

type AppConfigState = AppConfig & {
  syncFromServer: () => Promise<void>;
};

export const useAppConfig = create<AppConfigState>()(
  persist(
    (set) => ({
      ...EMPTY_CONFIG,
      syncFromServer: async () => {
        try {
          const cfg = await fetchAppConfig();
          set(cfg);
        } catch {
        }
      },
    }),
    {
      name: 'nutrilens-app-config',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        maintenance: s.maintenance,
        announcement: s.announcement,
        minAppVersion: s.minAppVersion,
      }),
    },
  ),
);
