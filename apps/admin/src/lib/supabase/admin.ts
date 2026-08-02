import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import { env, serviceRoleKey } from '@/lib/env';

export function createAdminClient() {
  return createSupabaseClient(env.supabaseUrl, serviceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
