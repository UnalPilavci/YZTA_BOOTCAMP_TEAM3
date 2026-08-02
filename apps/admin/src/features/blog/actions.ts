'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { assertBlogger } from '@/lib/auth/assert-blogger';
import { writeAudit } from '@/lib/audit';
import {
  createArticle,
  deleteArticle,
  setFeatured,
  setPublished,
  updateArticle,
  uploadCover,
  type ArticleInput,
} from '@/features/blog/service';

function parseArticleForm(formData: FormData): ArticleInput & { coverFile: File | null } {
  const coverFile = formData.get('cover');
  return {
    category: String(formData.get('category') ?? ''),
    title: String(formData.get('title') ?? '').trim(),
    subtitle: String(formData.get('subtitle') ?? '').trim(),
    body: String(formData.get('body') ?? ''),
    author_name: String(formData.get('author_name') ?? '').trim(),
    author_initial: String(formData.get('author_initial') ?? '').trim(),
    read_minutes: Math.max(1, Number(formData.get('read_minutes') ?? 3) || 3),
    cover_url: (String(formData.get('cover_url') ?? '').trim() || null) as string | null,
    coverFile: coverFile instanceof File && coverFile.size > 0 ? coverFile : null,
  };
}

export async function createArticleAction(formData: FormData): Promise<void> {
  const { actorId } = await assertBlogger();
  const { coverFile, ...input } = parseArticleForm(formData);
  if (!input.title || !input.category || !input.author_name) {
    throw new Error('Başlık, kategori ve yazar zorunlu.');
  }
  if (coverFile) input.cover_url = await uploadCover(coverFile);
  const article = await createArticle(input);
  await writeAudit({ actorId, action: 'article.create', entity: 'articles', entityId: article.id });
  revalidatePath('/blog');
  redirect(`/blog/${article.id}`);
}

export async function updateArticleAction(id: string, formData: FormData): Promise<void> {
  const { actorId } = await assertBlogger();
  const { coverFile, ...input } = parseArticleForm(formData);
  if (!input.title || !input.category || !input.author_name) {
    throw new Error('Başlık, kategori ve yazar zorunlu.');
  }
  if (coverFile) input.cover_url = await uploadCover(coverFile);
  await updateArticle(id, input);
  await writeAudit({ actorId, action: 'article.update', entity: 'articles', entityId: id });
  revalidatePath('/blog');
  revalidatePath(`/blog/${id}`);
}

export async function deleteArticleAction(id: string): Promise<void> {
  const { actorId } = await assertBlogger();
  await deleteArticle(id);
  await writeAudit({ actorId, action: 'article.delete', entity: 'articles', entityId: id });
  revalidatePath('/blog');
  redirect('/blog');
}

export async function togglePublishAction(id: string, published: boolean): Promise<void> {
  const { actorId } = await assertBlogger();
  await setPublished(id, published);
  await writeAudit({
    actorId,
    action: published ? 'article.publish' : 'article.unpublish',
    entity: 'articles',
    entityId: id,
  });
  revalidatePath('/blog');
  revalidatePath(`/blog/${id}`);
}

export async function toggleFeaturedAction(id: string, featured: boolean): Promise<void> {
  const { actorId } = await assertBlogger();
  await setFeatured(id, featured);
  await writeAudit({
    actorId,
    action: featured ? 'article.feature' : 'article.unfeature',
    entity: 'articles',
    entityId: id,
  });
  revalidatePath('/blog');
  revalidatePath(`/blog/${id}`);
}
