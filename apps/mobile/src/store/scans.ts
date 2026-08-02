import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AnalysisResult } from '@/services/analysis/types';
import { deleteScan, fetchScans, upsertScan } from '@/services/supabase/scans';
import { useAuth } from '@/store/auth';

export type ScanRecord = AnalysisResult & {
  id: string;
  createdAt: number;
  imageUri?: string;
  syncedAt?: number;
  consumed: boolean;
};

const MAX_SCANS = 200;

type ScansState = {
  scans: ScanRecord[];
  ownerId: string | null;
  add: (result: AnalysisResult, imageUri?: string) => ScanRecord;
  remove: (id: string) => void;
  toggleConsumed: (id: string) => void;
  clear: () => void;
  syncFromServer: (userId: string) => Promise<void>;
};

export const useScans = create<ScansState>()(
  persist(
    (set, get) => ({
      scans: [],
      ownerId: null,

      add: (result, imageUri) => {
        const record: ScanRecord = {
          ...result,
          id: Crypto.randomUUID(),
          createdAt: Date.now(),
          imageUri,
          syncedAt: undefined,
          consumed: false,
        };
        set((state) => ({ scans: [record, ...state.scans].slice(0, MAX_SCANS) }));

        const userId = useAuth.getState().userId;
        if (userId) {
          void upsertScan(userId, record)
            .then(() =>
              set((state) => ({
                scans: state.scans.map((s) =>
                  s.id === record.id ? { ...s, syncedAt: Date.now() } : s,
                ),
              })),
            )
            .catch(() => {});
        }
        return record;
      },

      remove: (id) => {
        set((state) => ({ scans: state.scans.filter((s) => s.id !== id) }));
        void deleteScan(id).catch(() => {});
      },

      toggleConsumed: (id) => {
        const record = get().scans.find((s) => s.id === id);
        if (!record) return;
        const next = { ...record, consumed: !record.consumed };
        set((state) => ({
          scans: state.scans.map((s) => (s.id === id ? next : s)),
        }));
        const userId = useAuth.getState().userId;
        if (userId) void upsertScan(userId, next).catch(() => {});
      },

      clear: () => set({ scans: [], ownerId: null }),

      syncFromServer: async (userId) => {
        if (get().ownerId && get().ownerId !== userId) {
          set({ scans: [], ownerId: userId });
        } else {
          set({ ownerId: userId });
        }

        for (const rec of get().scans.filter((s) => s.syncedAt == null)) {
          try {
            await upsertScan(userId, rec);
            set((state) => ({
              scans: state.scans.map((s) =>
                s.id === rec.id ? { ...s, syncedAt: Date.now() } : s,
              ),
            }));
          } catch {
          }
        }

        let remote: ScanRecord[];
        try {
          remote = await fetchScans(userId, MAX_SCANS);
        } catch {
          return;
        }
        set((state) => {
          const byId = new Map<string, ScanRecord>();
          for (const r of remote) byId.set(r.id, r);
          for (const local of state.scans) {
            if (!byId.has(local.id)) byId.set(local.id, local);
          }
          const merged = [...byId.values()]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, MAX_SCANS);
          return { scans: merged };
        });
      },
    }),
    {
      name: 'nutrilens-scans',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ scans: s.scans, ownerId: s.ownerId }),
    },
  ),
);

export function useScansHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useScans.persist.hasHydrated());

  useEffect(() => {
    const unsub = useScans.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useScans.persist.hasHydrated());
    return unsub;
  }, []);

  return hydrated;
}
