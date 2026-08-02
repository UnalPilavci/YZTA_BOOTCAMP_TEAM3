'use server';

import { revalidatePath } from 'next/cache';

import { assertAdmin } from '@/lib/auth/assert-admin';
import { writeAudit } from '@/lib/audit';
import { setConfig } from '@/features/settings/service';

export async function saveSettingsAction(formData: FormData): Promise<void> {
  const { actorId } = await assertAdmin();

  const maintenance = {
    enabled: formData.get('maintenance_enabled') === 'on',
    message_tr: String(formData.get('maintenance_message_tr') ?? '').trim(),
    message_en: String(formData.get('maintenance_message_en') ?? '').trim(),
  };
  const min_app_version = { value: String(formData.get('min_app_version') ?? '').trim() };
  const announcement = {
    active: formData.get('announcement_active') === 'on',
    text_tr: String(formData.get('announcement_text_tr') ?? '').trim(),
    text_en: String(formData.get('announcement_text_en') ?? '').trim(),
  };

  await Promise.all([
    setConfig('maintenance', maintenance),
    setConfig('min_app_version', min_app_version),
    setConfig('announcement', announcement),
  ]);
  await writeAudit({ actorId, action: 'settings.update', entity: 'app_config', entityId: null });
  revalidatePath('/settings');
}
