import { supabase } from './client';

export type AppConfig = {
  maintenance: { enabled: boolean; messageTr: string; messageEn: string };
  announcement: { active: boolean; textTr: string; textEn: string };
  minAppVersion: string;
};

export const EMPTY_CONFIG: AppConfig = {
  maintenance: { enabled: false, messageTr: '', messageEn: '' },
  announcement: { active: false, textTr: '', textEn: '' },
  minAppVersion: '',
};

export async function fetchAppConfig(): Promise<AppConfig> {
  const { data, error } = await supabase.from('app_config').select('key, value');
  if (error) throw error;
  const map = new Map<string, Record<string, unknown>>();
  for (const r of (data as { key: string; value: Record<string, unknown> }[] | null) ?? []) {
    map.set(r.key, r.value ?? {});
  }
  const m = map.get('maintenance') ?? {};
  const a = map.get('announcement') ?? {};
  const v = map.get('min_app_version') ?? {};
  return {
    maintenance: {
      enabled: Boolean(m.enabled),
      messageTr: String(m.message_tr ?? ''),
      messageEn: String(m.message_en ?? ''),
    },
    announcement: {
      active: Boolean(a.active),
      textTr: String(a.text_tr ?? ''),
      textEn: String(a.text_en ?? ''),
    },
    minAppVersion: String(v.value ?? ''),
  };
}
