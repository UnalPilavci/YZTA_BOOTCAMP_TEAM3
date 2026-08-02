import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { PageHeader } from '@/components/ui';
import { createArticleAction } from '@/features/blog/actions';
import { ArticleForm } from '@/features/blog/article-form';
import { listCategories } from '@/features/categories/service';
import { assertBlogger } from '@/lib/auth/assert-blogger';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  await assertBlogger();
  const categories = await listCategories();

  return (
    <div className="px-8 py-8">
      <Link href="/blog" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Blog
      </Link>
      <PageHeader title="Yeni yazı" subtitle="Taslak olarak oluşturulur; sonra yayınlarsın." />
      <ArticleForm action={createArticleAction} categories={categories} />
    </div>
  );
}
