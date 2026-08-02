import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Badge, LinkButton, PageHeader } from '@/components/ui';
import { ExerciseCategoryManager } from '@/features/exercises/controls';
import { listExerciseCategories, listExercises } from '@/features/exercises/service';
import { assertAdmin } from '@/lib/auth/assert-admin';

export const dynamic = 'force-dynamic';

const DIFF_LABEL: Record<string, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
};

export default async function ExercisesPage() {
  await assertAdmin();
  const [exercises, categories] = await Promise.all([listExercises(), listExerciseCategories()]);
  const catById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="px-8 py-8 space-y-8">
      <div>
        <PageHeader
          title="Spor Hareketleri"
          subtitle={`${exercises.length} egzersiz`}
          action={
            <LinkButton href="/exercises/new">
              <Plus className="h-4 w-4" />
              Yeni egzersiz
            </LinkButton>
          }
        />

        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Egzersiz</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">MET</th>
                <th className="px-4 py-3 font-medium">Zorluk</th>
                <th className="px-4 py-3 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {exercises.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    Egzersiz yok.
                  </td>
                </tr>
              ) : (
                exercises.map((e) => {
                  const cat = catById.get(e.category_id);
                  return (
                    <tr key={e.id} className="hover:bg-cream/40">
                      <td className="px-4 py-3">
                        <Link href={`/exercises/${e.id}`} className="font-medium text-ink hover:underline">
                          {e.name_tr}
                        </Link>
                        <span className="ml-2 font-mono text-xs text-muted">{e.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={cat?.color}>{cat?.label_tr ?? e.category_id}</Badge>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted">{e.met}</td>
                      <td className="px-4 py-3 text-muted">{DIFF_LABEL[e.difficulty] ?? e.difficulty}</td>
                      <td className="px-4 py-3">
                        {e.active ? <Badge color="#16A34A">Aktif</Badge> : <Badge color="#9CA3AF">Pasif</Badge>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExerciseCategoryManager categories={categories} />

      <p className="text-xs text-muted">
        {
          'Mobil uygulama bu tablolardan okur (aktif kayıtlar; çevrimdışı için koddaki sabitlere düşer). Değişiklikler uygulamanın bir sonraki açılışında / Spor sekmesi tazelendiğinde görünür.'
        }
      </p>
    </div>
  );
}
