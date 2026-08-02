import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Badge, PageHeader } from '@/components/ui';
import {
  AdminControl,
  BanControl,
  BloggerControl,
  DeleteUserControl,
  PlanControl,
  TrainerControl,
} from '@/features/users/controls';
import { getUserDetail } from '@/features/users/service';
import { assertAdmin } from '@/lib/auth/assert-admin';

export const dynamic = 'force-dynamic';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await assertAdmin();
  const { id } = await params;
  const u = await getUserDetail(id);
  if (!u) notFound();

  const label = u.displayName || u.username || u.email || id;

  return (
    <div className="px-8 py-8">
      <Link href="/users" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Kullanıcılar
      </Link>

      <PageHeader
        title={label}
        subtitle={u.email ?? undefined}
        action={
          <div className="flex items-center gap-1.5">
            {u.banned && <Badge color="#DC2626">askıda</Badge>}
            {u.isAdmin && <Badge color="#DFAF00">admin</Badge>}
            {u.isBlogger && <Badge color="#7C3AED">blog yazarı</Badge>}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-xl border border-line bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Topluluk</h2>
            <dl className="grid grid-cols-3 gap-4 text-center">
              <Stat label="Gönderi" value={u.postCount} />
              <Stat label="Takipçi" value={u.followerCount} />
              <Stat label="Takip" value={u.followingCount} />
            </dl>
            {u.bio && <p className="mt-4 text-sm text-muted">{u.bio}</p>}
          </section>

          <section className="rounded-xl border border-line bg-white p-5">
            <h2 className="mb-1 text-sm font-semibold text-ink">Sağlık verisi</h2>
            <p className="mb-4 text-xs text-muted">
              Gizlilik gereği yalnızca sayılar gösterilir; içerik görüntüleme
              ayrı ve denetim kaydına yazılan bir akışta açılacaktır.
            </p>
            <dl className="grid grid-cols-2 gap-4 text-center">
              <Stat label="Tarama" value={u.scanCount} />
              <Stat label="Öğün" value={u.mealCount} />
            </dl>
          </section>

          <section className="rounded-xl border border-line bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Hesap</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Kullanıcı ID" value={<span className="font-mono text-xs">{u.id}</span>} />
              <Row
                label="Kayıt"
                value={u.createdAt ? new Date(u.createdAt).toLocaleString('tr-TR') : '—'}
              />
              <Row
                label="Son giriş"
                value={u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleString('tr-TR') : '—'}
              />
            </dl>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-line bg-white p-4 space-y-3">
            <span className="text-sm font-medium text-ink">Paket</span>
            <PlanControl id={u.id} plan={u.plan} />
          </div>
          <div className="rounded-xl border border-line bg-white p-4 space-y-2">
            <span className="text-sm font-medium text-ink">Roller</span>
            <TrainerControl id={u.id} isTrainer={u.isTrainer} />
            <BloggerControl id={u.id} isBlogger={u.isBlogger} />
            <AdminControl id={u.id} isAdmin={u.isAdmin} />
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 space-y-2">
            <span className="text-sm font-medium text-red-700">Tehlikeli bölge</span>
            <BanControl id={u.id} banned={u.banned} />
            <DeleteUserControl id={u.id} label={label} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
