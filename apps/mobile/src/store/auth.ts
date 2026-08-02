import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import {
  deleteOwnAccount,
  getSessionSafe,
  onAuthStateChange,
  sendPasswordReset,
  signInWithPassword,
  signOut as apiSignOut,
  signUpWithPassword,
} from '@/services/supabase/auth';

type AuthState = {
  sessionReady: boolean;
  session: Session | null;
  signedIn: boolean;
  userId: string | null;
  email: string | null;

  init: () => () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

function fromSession(session: Session | null) {
  return {
    session,
    signedIn: session !== null,
    userId: session?.user.id ?? null,
    email: session?.user.email ?? null,
  };
}

export const useAuth = create<AuthState>()((set) => ({
  sessionReady: false,
  session: null,
  signedIn: false,
  userId: null,
  email: null,

  init: () => {
    const unsub = onAuthStateChange((session) => {
      set({ ...fromSession(session), sessionReady: true });
    });

    void getSessionSafe().then((session) => {
      set({ ...fromSession(session), sessionReady: true });
    });

    return unsub;
  },

  signIn: async (email, password) => {
    const session = await signInWithPassword(email, password);
    set({ ...fromSession(session), sessionReady: true });
  },

  signUp: async (email, password) => {
    const session = await signUpWithPassword(email, password);
    set({ ...fromSession(session), sessionReady: true });
  },

  signOut: async () => {
    await apiSignOut();
    set({ ...fromSession(null), sessionReady: true });
  },

  deleteAccount: async () => {
    await deleteOwnAccount();
    await apiSignOut().catch(() => {});
    set({ ...fromSession(null), sessionReady: true });
  },

  resetPassword: async (email) => {
    await sendPasswordReset(email);
  },
}));
