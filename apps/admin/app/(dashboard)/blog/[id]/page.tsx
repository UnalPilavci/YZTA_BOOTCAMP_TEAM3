import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Badge, PageHeader } from '@/components/ui';
import { updateArticleAction } from '@/features/blog/actions';
import { ArticleForm } from '@/features/blog/article-form';
import { DeleteButton, FeatureToggle, PublishToggle } from '@/features/blog/controls';
import { getArticle } from '@/features/blog/service';
import { listCategories } from '@/features/categories/service';
import { assertBlogger } from '@/lib/auth/assert-blogger';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await assertBlogger();
  const { id } = await params;
  const [article, categories] = await Promise.all([getArticle(id), listCategories()]);
  if (!article) notFound();

  const action = updateArticleAction.bind(null, id);

  return (
    <div className="px-8 py-8">
      <Link href="/blog" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Blog
      </Link>

      <PageHeader
        title="Yazıyı düzenle"
        subtitle={article.published ? 'Yayında' : 'Taslak'}
        action={
          <div className="flex items-center gap-2">
            {article.published ? <Badge color="#16A34A">Yayında</Badge> : <Badge color="#9CA3AF">Taslak</Badge>}
            <FeatureToggle id={article.id} featured={article.featured} />
            <PublishToggle id={article.id} published={article.published} />
            <DeleteButton id={article.id} title={article.title} />
          </div>
        }
      />

      <ArticleForm action={action} categories={categories} article={article} />
    </div>
  );
}
