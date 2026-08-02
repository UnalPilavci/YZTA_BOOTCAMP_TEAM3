import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type AppConfig = {
  maintenance: { enabled: boolean; message_tr: string; message_en: string };
  min_app_version: { value: string };
  announcement: { active: boolean; text_tr: string; text_en: string };
};

const DEFAULTS: AppConfig = {
  maintenance: { enabled: false, message_tr: '', message_en: '' },
  min_app_version: { value: '' },
  announcement: { active: false, text_tr: '', text_en: '' },
};

export async function getConfig(): Promise<AppConfig> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('app_config').select('key, value');
  if (error) throw error;
  const map = new Map<string, unknown>();
  for (const r of (data as { key: string; value: unknown }[] | null) ?? []) map.set(r.key, r.value);
  return {
    maintenance: { ...DEFAULTS.maintenance, ...(map.get('maintenance') as object) },
    min_app_version: { ...DEFAULTS.min_app_version, ...(map.get('min_app_version') as object) },
    announcement: { ...DEFAULTS.announcement, ...(map.get('announcement') as object) },
  };
}

export async function setConfig(key: string, value: unknown): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('app_config')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
}
