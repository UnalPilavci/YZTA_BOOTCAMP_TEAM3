'use server';

import { redirect } from 'next/navigation';

import { getCurrentAdmin } from '@/lib/auth/current-admin';
import { createClient } from '@/lib/supabase/server';

export type LoginState = { error: string | null };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'E-posta ve şifre gerekli.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: 'Giriş başarısız. E-posta veya şifre hatalı.' };
  }

  const admin = await getCurrentAdmin();
  if (!admin?.isAdmin) {
    await supabase.auth.signOut();
    return { error: 'Bu hesabın panel yetkisi yok.' };
  }

  redirect('/');
}
