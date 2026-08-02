import type { Session } from '@supabase/supabase-js';

import { supabase } from './client';

export type AuthErrorKind =
  | 'invalidCredentials'
  | 'emailTaken'
  | 'weakPassword'
  | 'network'
  | 'unknown';

export class AuthError extends Error {
  constructor(
    readonly kind: AuthErrorKind,
    readonly messageKey: string,
    message?: string,
  ) {
    super(message ?? kind);
    this.name = 'AuthError';
  }
}

function mapError(raw: unknown): AuthError {
  const msg = (raw instanceof Error ? raw.message : String(raw)).toLowerCase();

  if (msg.includes('invalid login credentials')) {
    return new AuthError('invalidCredentials', 'auth.errInvalidCredentials', msg);
  }
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return new AuthError('emailTaken', 'auth.errEmailTaken', msg);
  }
  if (msg.includes('password')) {
    return new AuthError('weakPassword', 'auth.errWeakPassword', msg);
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return new AuthError('network', 'auth.errNetwork', msg);
  }
  return new AuthError('unknown', 'auth.errUnknown', msg);
}

export async function getSessionSafe(timeoutMs = 4000): Promise<Session | null> {
  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    return result?.data?.session ?? null;
  } catch {
    return null;
  }
}

export function onAuthStateChange(cb: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}

export async function signInWithPassword(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw mapError(error);
  if (!data.session) throw new AuthError('unknown', 'auth.errUnknown', 'no session returned');
  return data.session;
}

export async function signUpWithPassword(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  if (error) throw mapError(error);
  if (!data.session) {
    throw new AuthError('unknown', 'auth.errConfirmEmail', 'signUp returned no session');
  }
  return data.session;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
  if (error) throw mapError(error);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw mapError(error);
}

export async function deleteOwnAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_own_account');
  if (error) throw mapError(error);
}
