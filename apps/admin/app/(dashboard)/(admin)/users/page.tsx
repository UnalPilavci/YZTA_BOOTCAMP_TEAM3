import { Search } from 'lucide-react';
import Link from 'next/link';

import { Badge, Input, PageHeader } from '@/components/ui';
import { listUsers, type PlanId } from '@/features/users/service';
import { assertAdmin } from '@/lib/auth/assert-admin';

export const dynamic = 'force-dynamic';

const PLAN_COLOR: Record<PlanId, string> = {
  free: '#9CA3AF',
  premium: '#DFAF00',
  pro: '#FF2E7E',
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await assertAdmin();
  const { q } = await searchParams;
  const users = await listUsers(q);

  return (
    <div className="px-8 py-8">
      <PageHeader title="Kullanıcılar" subtitle={`${users.length} kayıt`} />

      <form className="mb-4 flex max-w-sm items-center gap-2" action="/users">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input name="q" defaultValue={q ?? ''} placeholder="E-posta ara…" className="pl-9" />
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Kullanıcı</th>
              <th className="px-4 py-3 font-medium">E-posta</th>
              <th className="px-4 py-3 font-medium">Paket</th>
              <th className="px-4 py-3 font-medium">Roller</th>
              <th className="px-4 py-3 font-medium">Son giriş</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-cream/40">
                  <td className="px-4 py-3">
                    <Link href={`/users/${u.id}`} className="font-medium text-ink hover:underline">
                      {u.displayName || u.username || '(isimsiz)'}
                    </Link>
                    {u.username && <span className="ml-1 text-muted">@{u.username}</span>}
                    {u.banned && (
                      <Badge color="#DC2626" className="ml-2">
                        askıda
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge color={PLAN_COLOR[u.plan]}>{u.plan}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.isAdmin && <Badge color="#DFFB4B">admin</Badge>}
                      {u.isBlogger && <Badge color="#C4B5FD">blog</Badge>}
                      {u.isTrainer && <Badge color="#4CAF7D">antrenör</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString('tr-TR') : '—'}
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
