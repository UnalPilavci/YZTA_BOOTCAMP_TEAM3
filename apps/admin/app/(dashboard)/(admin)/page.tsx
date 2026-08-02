import {
  BookOpen,
  Dumbbell,
  Flame,
  MessagesSquare,
  ScanLine,
  Users,
} from 'lucide-react';

import { assertAdmin } from '@/lib/auth/assert-admin';
import { getDashboardStats } from '@/features/dashboard/stats';
import { TrendChart } from '@/features/dashboard/trend-chart';
import { getDailyTrends } from '@/features/dashboard/trends';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await assertAdmin();
  const [stats, trends] = await Promise.all([getDashboardStats(), getDailyTrends(30)]);
  const totalPlans =
    stats.planDistribution.free + stats.planDistribution.premium + stats.planDistribution.pro || 1;

  return (
    <div className="px-8 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-ink">Genel Bakış</h1>
        <p className="mt-1 text-sm text-muted">Uygulama genelindeki güncel sayılar</p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Kullanıcı" value={stats.users} Icon={Users} />
        <Kpi
          label="Blog (yayında)"
          value={stats.publishedArticles}
          sub={`${stats.totalArticles} toplam`}
          Icon={BookOpen}
        />
        <Kpi label="Gönderi" value={stats.posts} sub={`${stats.comments} yorum`} Icon={MessagesSquare} />
        <Kpi label="Öğün" value={stats.meals} Icon={Flame} />
        <Kpi label="Tarama" value={stats.scans} Icon={ScanLine} />
        <Kpi label="İlan" value={stats.listings} Icon={Dumbbell} />
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Son 30 gün</h2>
        <TrendChart data={trends} />
      </section>

      <section className="mt-6 max-w-md rounded-2xl border border-line bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Paket Dağılımı</h2>
        <div className="space-y-3">
          <PlanBar label="Free" value={stats.planDistribution.free} total={totalPlans} color="#9CA3AF" />
          <PlanBar
            label="Premium"
            value={stats.planDistribution.premium}
            total={totalPlans}
            color="#DFFB4B"
          />
          <PlanBar label="Pro" value={stats.planDistribution.pro} total={totalPlans} color="#FF2E7E" />
        </div>
      </section>

      <p className="mt-8 text-xs text-muted">
        Sonraki fazlar: blog yönetimi (F1), kullanıcı & moderasyon (F2), spor hareketleri (F3),
        grafikler & ayarlar (F4).
      </p>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  Icon,
}: {
  label: string;
  value: number;
  sub?: string;
  Icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-ink">
        <Icon className="h-4 w-4 text-lime" />
      </div>
      <p className="text-2xl font-semibold tabular-nums text-ink">{value.toLocaleString('tr-TR')}</p>
      <p className="text-sm text-muted">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function PlanBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = Math.round((value / total) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-ink">{label}</span>
        <span className="tabular-nums text-muted">
          {value} · %{pct}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
