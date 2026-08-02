import Link from 'next/link';

import { Badge, PageHeader } from '@/components/ui';
import { DeleteFeedbackButton } from '@/features/feedback/controls';
import { feedbackCounts, listFeedback, type FeedbackCategory } from '@/features/feedback/service';
import { assertAdmin } from '@/lib/auth/assert-admin';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  bug: 'Hata',
  suggestion: 'Öneri',
  content: 'İçerik',
  other: 'Diğer',
};
const CATEGORY_COLOR: Record<FeedbackCategory, string> = {
  bug: '#DC2626',
  suggestion: '#2563EB',
  content: '#7C3AED',
  other: '#6B7280',
};

function isCategory(v: string | undefined): v is FeedbackCategory {
  return v === 'bug' || v === 'suggestion' || v === 'content' || v === 'other';
}

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  await assertAdmin();
  const { cat } = await searchParams;
  const active = isCategory(cat) ? cat : 'all';
  const [all, counts] = await Promise.all([listFeedback(), feedbackCounts()]);
  const items = active === 'all' ? all : all.filter((f) => f.category === active);

  return (
    <div className="px-8 py-8">
      <PageHeader title="Geri Bildirim" subtitle={`${counts.total} geri dönüş`} />

      <div className="mb-5 flex flex-wrap gap-2">
        <FilterChip href="/feedback" label="Tümü" count={counts.total} active={active === 'all'} />
        {(['bug', 'suggestion', 'content', 'other'] as const).map((c) => (
          <FilterChip
            key={c}
            href={`/feedback?cat=${c}`}
            label={CATEGORY_LABEL[c]}
            count={counts[c]}
            active={active === c}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Mesaj</th>
              <th className="px-4 py-3 font-medium">Kullanıcı</th>
              <th className="px-4 py-3 font-medium">İletişim</th>
              <th className="px-4 py-3 font-medium">Sürüm</th>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  Geri bildirim yok.
                </td>
              </tr>
            ) : (
              items.map((f) => (
                <tr key={f.id} className="hover:bg-cream/40 align-top">
                  <td className="px-4 py-3">
                    <Badge color={CATEGORY_COLOR[f.category]}>{CATEGORY_LABEL[f.category]}</Badge>
                  </td>
                  <td className="max-w-md px-4 py-3 text-ink">
                    <span className="whitespace-pre-wrap">{f.message}</span>
                  </td>
                  <td className="px-4 py-3">
                    {f.userId ? (
                      <Link href={`/users/${f.userId}`} className="text-ink hover:underline">
                        {f.authorName}
                      </Link>
                    ) : (
                      <span className="text-muted">(silinmiş)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {f.email ? (
                      <a href={`mailto:${f.email}`} className="hover:underline">
                        {f.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{f.appVersion || '—'}</td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {new Date(f.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteFeedbackButton id={f.id} />
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

function FilterChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
        active ? 'border-ink bg-ink text-lime font-medium' : 'border-line bg-white text-muted hover:text-ink',
      )}>
      {label}
      <span className={cn('rounded-full px-1.5 text-xs', active ? 'bg-white/15' : 'bg-cream text-muted')}>
        {count}
      </span>
    </Link>
  );
}
