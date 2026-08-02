import Link from 'next/link';

import { Badge, PageHeader } from '@/components/ui';
import {
  DeleteCommentButton,
  DeletePostButton,
  ReportActions,
} from '@/features/moderation/controls';
import {
  countOpenReports,
  listComments,
  listPosts,
  listReports,
} from '@/features/moderation/service';
import { assertAdmin } from '@/lib/auth/assert-admin';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Tab = 'posts' | 'comments' | 'reports';

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await assertAdmin();
  const { tab: tabParam } = await searchParams;
  const tab: Tab = tabParam === 'comments' ? 'comments' : tabParam === 'reports' ? 'reports' : 'posts';
  const openReports = await countOpenReports();

  return (
    <div className="px-8 py-8">
      <PageHeader title="Topluluk & Moderasyon" subtitle="Gönderiler, yorumlar ve şikâyetler" />

      <div className="mb-5 flex gap-1 border-b border-line">
        <TabLink href="/community?tab=posts" active={tab === 'posts'} label="Gönderiler" />
        <TabLink href="/community?tab=comments" active={tab === 'comments'} label="Yorumlar" />
        <TabLink
          href="/community?tab=reports"
          active={tab === 'reports'}
          label="Şikâyetler"
          badge={openReports || undefined}
        />
      </div>

      {tab === 'posts' && <PostsTab />}
      {tab === 'comments' && <CommentsTab />}
      {tab === 'reports' && <ReportsTab />}
    </div>
  );
}

function TabLink({
  href,
  active,
  label,
  badge,
}: {
  href: string;
  active: boolean;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        '-mb-px border-b-2 px-4 py-2 text-sm',
        active ? 'border-ink font-medium text-ink' : 'border-transparent text-muted hover:text-ink',
      )}>
      {label}
      {badge ? <span className="ml-2 rounded-full bg-red-100 px-1.5 text-xs text-red-600">{badge}</span> : null}
    </Link>
  );
}

async function PostsTab() {
  const posts = await listPosts();
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Yazar</th>
            <th className="px-4 py-3 font-medium">Ürün / Öğün</th>
            <th className="px-4 py-3 font-medium">İçerik</th>
            <th className="px-4 py-3 font-medium">Etkileşim</th>
            <th className="px-4 py-3 font-medium text-right">İşlem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {posts.length === 0 ? (
            <EmptyRow cols={5} />
          ) : (
            posts.map((p) => (
              <tr key={p.id} className="hover:bg-cream/40">
                <td className="px-4 py-3">
                  <Link href={`/users/${p.userId}`} className="text-ink hover:underline">
                    {p.authorName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink">{p.productName}</td>
                <td className="max-w-xs px-4 py-3 text-muted">
                  <span className="line-clamp-2">{p.body || '—'}</span>
                </td>
                <td className="px-4 py-3 text-muted">
                  ♥ {p.likeCount} · 💬 {p.commentCount}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeletePostButton id={p.id} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

async function CommentsTab() {
  const comments = await listComments();
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Yazar</th>
            <th className="px-4 py-3 font-medium">Yorum</th>
            <th className="px-4 py-3 font-medium">Tarih</th>
            <th className="px-4 py-3 font-medium text-right">İşlem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {comments.length === 0 ? (
            <EmptyRow cols={4} />
          ) : (
            comments.map((c) => (
              <tr key={c.id} className="hover:bg-cream/40">
                <td className="px-4 py-3">
                  <Link href={`/users/${c.userId}`} className="text-ink hover:underline">
                    {c.authorName}
                  </Link>
                </td>
                <td className="max-w-md px-4 py-3 text-ink">
                  <span className="line-clamp-2">{c.body}</span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteCommentButton id={c.id} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

async function ReportsTab() {
  const reports = await listReports();
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Hedef</th>
            <th className="px-4 py-3 font-medium">Sebep</th>
            <th className="px-4 py-3 font-medium">Şikâyet eden</th>
            <th className="px-4 py-3 font-medium">Durum</th>
            <th className="px-4 py-3 font-medium text-right">İşlem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {reports.length === 0 ? (
            <EmptyRow cols={5} text="Şikâyet yok — temiz." />
          ) : (
            reports.map((r) => (
              <tr key={r.id} className="hover:bg-cream/40">
                <td className="px-4 py-3">
                  <Badge>{r.targetType}</Badge>
                  <span className="ml-2 font-mono text-xs text-muted">{r.targetId.slice(0, 8)}…</span>
                </td>
                <td className="max-w-xs px-4 py-3 text-ink">
                  <span className="line-clamp-2">{r.reason || '—'}</span>
                </td>
                <td className="px-4 py-3 text-muted">{r.reporterName}</td>
                <td className="px-4 py-3">
                  <ReportStatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <ReportActions id={r.id} status={r.status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ReportStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: '#DC2626',
    reviewing: '#DFAF00',
    resolved: '#16A34A',
    dismissed: '#9CA3AF',
  };
  return <Badge color={map[status] ?? '#9CA3AF'}>{status}</Badge>;
}

function EmptyRow({ cols, text = 'Kayıt yok.' }: { cols: number; text?: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-muted">
        {text}
      </td>
    </tr>
  );
}
