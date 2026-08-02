import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Badge, LinkButton, PageHeader } from '@/components/ui';
import { FeatureToggle, PublishToggle } from '@/features/blog/controls';
import { listArticles } from '@/features/blog/service';
import { listCategories } from '@/features/categories/service';
import { assertBlogger } from '@/lib/auth/assert-blogger';

export const dynamic = 'force-dynamic';

export default async function BlogListPage() {
  await assertBlogger();
  const [articles, categories] = await Promise.all([listArticles(), listCategories()]);
  const catById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="px-8 py-8">
      <PageHeader
        title="Blog"
        subtitle={`${articles.length} yazı`}
        action={
          <LinkButton href="/blog/new">
            <Plus className="h-4 w-4" />
            Yeni yazı
          </LinkButton>
        }
      />

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Başlık</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium">Güncellendi</th>
              <th className="px-4 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Henüz yazı yok. “Yeni yazı” ile başla.
                </td>
              </tr>
            ) : (
              articles.map((a) => {
                const cat = catById.get(a.category);
                return (
                  <tr key={a.id} className="hover:bg-cream/40">
                    <td className="px-4 py-3">
                      <Link href={`/blog/${a.id}`} className="font-medium text-ink hover:underline">
                        {a.title}
                      </Link>
                      {a.featured && (
                        <Badge color="#DFAF00" className="ml-2">
                          öne çıkan
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={cat?.color}>{cat?.label_tr ?? a.category}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {a.published ? (
                        <Badge color="#16A34A">Yayında</Badge>
                      ) : (
                        <Badge color="#9CA3AF">Taslak</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(a.updated_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <FeatureToggle id={a.id} featured={a.featured} />
                        <PublishToggle id={a.id} published={a.published} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
