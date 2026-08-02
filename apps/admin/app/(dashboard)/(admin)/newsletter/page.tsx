import Link from 'next/link';

import { Badge, PageHeader } from '@/components/ui';
import {
  listSubscribers,
  subscriberStats,
  type NewsletterTopic,
} from '@/features/newsletter/service';
import { assertAdmin } from '@/lib/auth/assert-admin';

export const dynamic = 'force-dynamic';

const TOPIC_LABEL: Record<NewsletterTopic, string> = {
  recipes: 'Tarifler',
  tips: 'İpuçları',
  contests: 'Yarışmalar',
  features: 'Özellikler',
};

export default async function NewsletterPage() {
  await assertAdmin();
  const [subscribers, stats] = await Promise.all([listSubscribers(), subscriberStats()]);

  return (
    <div className="px-8 py-8">
      <PageHeader
        title="Bülten Aboneleri"
        subtitle={`${stats.active} aktif · ${stats.total} toplam kayıt`}
      />

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Kullanıcı</th>
              <th className="px-4 py-3 font-medium">E-posta</th>
              <th className="px-4 py-3 font-medium">İlgi alanları</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium">Kayıt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Henüz abone yok.
                </td>
              </tr>
            ) : (
              subscribers.map((s) => (
                <tr key={s.userId} className="hover:bg-cream/40 align-top">
                  <td className="px-4 py-3">
                    <Link href={`/users/${s.userId}`} className="text-ink hover:underline">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <a href={`mailto:${s.email}`} className="hover:underline">
                      {s.email}
                    </a>
                  </td>
                  <td className="max-w-sm px-4 py-3">
                    {s.topics.length === 0 ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {s.topics.map((tpc) => (
                          <Badge key={tpc} color="#4CAF7D">
                            {TOPIC_LABEL[tpc] ?? tpc}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.subscribed ? (
                      <Badge color="#16A34A">Aktif</Badge>
                    ) : (
                      <Badge color="#9CA3AF">Ayrıldı</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
