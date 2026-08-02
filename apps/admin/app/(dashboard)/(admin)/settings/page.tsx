import { PageHeader } from '@/components/ui';
import { getConfig } from '@/features/settings/service';
import { SettingsForm } from '@/features/settings/settings-form';
import { assertAdmin } from '@/lib/auth/assert-admin';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await assertAdmin();
  const config = await getConfig();

  return (
    <div className="px-8 py-8">
      <PageHeader title="Ayarlar" subtitle="Uygulama geneli özellik bayrakları ve duyurular" />
      <SettingsForm config={config} />
      <p className="mt-6 max-w-2xl text-xs text-muted">
        Bu ayarlar <code>app_config</code> tablosunda tutulur ve herkese açık okunur;
        mobil uygulamanın ilgili yerlerde bu değerleri okuması ayrı bir mobil işi olarak
        eklenebilir.
      </p>
    </div>
  );
}
