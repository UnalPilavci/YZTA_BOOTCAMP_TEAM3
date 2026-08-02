import 'server-only';

import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';

export type AdminUser = {
  id: string;
  email: string | null;
  isAdmin: boolean;
  isBlogger: boolean;
};

export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('is_admin, is_blogger')
    .eq('id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    isAdmin: Boolean(data?.is_admin),
    isBlogger: Boolean(data?.is_blogger),
  };
});
