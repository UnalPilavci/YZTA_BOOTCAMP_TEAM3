import { Search } from 'lucide-react';

import { Badge, Input, PageHeader } from '@/components/ui';
import { listAudit } from '@/features/audit/service';
import { assertAdmin } from '@/lib/auth/assert-admin';

export const dynamic = 'force-dynamic';

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  await assertAdmin();
  const { action } = await searchParams;
  const entries = await listAudit(action);

  return (
    <div className="px-8 py-8">
      <PageHeader title="Denetim Kaydı" subtitle="Panelde yapılan yönetsel işlemler" />

      <form className="mb-4 flex max-w-sm items-center gap-2" action="/audit">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            name="action"
            defaultValue={action ?? ''}
            placeholder="Aksiyon filtrele (ör. user. veya article.publish)"
            className="pl-9"
          />
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Zaman</th>
              <th className="px-4 py-3 font-medium">Kim</th>
              <th className="px-4 py-3 font-medium">Aksiyon</th>
              <th className="px-4 py-3 font-medium">Nesne</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                  Kayıt yok.
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="hover:bg-cream/40">
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {new Date(e.createdAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-ink">{e.actorName}</td>
                  <td className="px-4 py-3">
                    <Badge>{e.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {e.entity}
                    {e.entityId ? (
                      <span className="ml-1 font-mono text-xs">{e.entityId.slice(0, 8)}…</span>
                    ) : null}
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
