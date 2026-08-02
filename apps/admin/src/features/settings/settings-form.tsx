'use client';

import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

import { Button, Field, Input, Textarea } from '@/components/ui';
import { saveSettingsAction } from '@/features/settings/actions';
import type { AppConfig } from '@/features/settings/service';

export function SettingsForm({ config }: { config: AppConfig }) {
  return (
    <form action={saveSettingsAction} className="max-w-2xl space-y-5">
      <section className="rounded-xl border border-line bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">Bakım modu</h2>
            <p className="text-xs text-muted">Açıkken uygulamada bakım ekranı gösterilir.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="maintenance_enabled" defaultChecked={config.maintenance.enabled} />
            Aktif
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mesaj (TR)">
            <Input name="maintenance_message_tr" defaultValue={config.maintenance.message_tr} />
          </Field>
          <Field label="Mesaj (EN)">
            <Input name="maintenance_message_en" defaultValue={config.maintenance.message_en} />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Minimum uygulama sürümü</h2>
          <p className="text-xs text-muted">
            Bu sürümün altındaki istemcilere güncelleme istenir (boş = kapalı).
          </p>
        </div>
        <Field label="Sürüm (ör. 1.2.0)">
          <Input name="min_app_version" defaultValue={config.min_app_version.value} placeholder="1.2.0" />
        </Field>
      </section>

      <section className="rounded-xl border border-line bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">Duyuru bandı</h2>
            <p className="text-xs text-muted">Uygulamada üst bantta gösterilecek kısa duyuru.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="announcement_active" defaultChecked={config.announcement.active} />
            Aktif
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Metin (TR)">
            <Textarea name="announcement_text_tr" rows={2} defaultValue={config.announcement.text_tr} />
          </Field>
          <Field label="Metin (EN)">
            <Textarea name="announcement_text_en" rows={2} defaultValue={config.announcement.text_en} />
          </Field>
        </div>
      </section>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Kaydet
    </Button>
  );
}
