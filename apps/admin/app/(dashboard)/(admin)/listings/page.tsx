import Link from 'next/link';

import { Badge, PageHeader } from '@/components/ui';
import { DeleteListingButton } from '@/features/listings/controls';
import { listListings } from '@/features/listings/service';
import { assertAdmin } from '@/lib/auth/assert-admin';

export const dynamic = 'force-dynamic';

const ROLE_LABEL: Record<string, string> = { trainer: 'Antrenör', dietitian: 'Diyetisyen' };
const WORK_MODE_LABEL: Record<string, string> = {
  remote: 'Uzaktan',
  onsite: 'Yüz yüze',
  hybrid: 'Hibrit',
};

export default async function ListingsPage() {
  await assertAdmin();
  const listings = await listListings();

  return (
    <div className="px-8 py-8">
      <PageHeader title="İlanlar" subtitle={`${listings.length} antrenör/diyetisyen ilanı`} />

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">İlan</th>
              <th className="px-4 py-3 font-medium">Sahibi</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Şehir / Mod</th>
              <th className="px-4 py-3 font-medium">İletişim</th>
              <th className="px-4 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  İlan yok.
                </td>
              </tr>
            ) : (
              listings.map((l) => (
                <tr key={l.id} className="hover:bg-cream/40">
                  <td className="max-w-xs px-4 py-3">
                    <p className="font-medium text-ink">{l.title}</p>
                    {l.bio && <p className="line-clamp-1 text-xs text-muted">{l.bio}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/users/${l.userId}`} className="text-ink hover:underline">
                      {l.authorName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={l.roleType === 'trainer' ? '#4C86E8' : '#4CAF7D'}>
                      {ROLE_LABEL[l.roleType]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {l.city || '—'}
                    {l.workMode ? ` · ${WORK_MODE_LABEL[l.workMode] ?? l.workMode}` : ''}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {[
                      l.contactPhone && '📞',
                      l.contactInstagram && 'IG',
                      l.contactWhatsapp && 'WA',
                    ]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteListingButton id={l.id} title={l.title} />
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
