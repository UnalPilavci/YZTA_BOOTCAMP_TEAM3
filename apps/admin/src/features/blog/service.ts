import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type Article = {
  id: string;
  external_id: string;
  category: string;
  title: string;
  subtitle: string | null;
  body: string;
  author_name: string;
  author_initial: string | null;
  read_minutes: number;
  featured: boolean;
  published: boolean;
  published_at: string | null;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ArticleInput = {
  category: string;
  title: string;
  subtitle: string;
  body: string;
  author_name: string;
  author_initial: string;
  read_minutes: number;
  cover_url: string | null;
};

const COVER_BUCKET = 'article-covers';

export async function listArticles(): Promise<Article[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Article[];
}

export async function getArticle(id: string): Promise<Article | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as Article) ?? null;
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .insert({
      external_id: `admin:${crypto.randomUUID()}`,
      category: input.category,
      title: input.title,
      subtitle: input.subtitle || null,
      body: input.body,
      author_name: input.author_name,
      author_initial: input.author_initial || null,
      read_minutes: input.read_minutes,
      cover_url: input.cover_url,
      published: false,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as Article;
}

export async function updateArticle(id: string, input: ArticleInput): Promise<Article> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .update({
      category: input.category,
      title: input.title,
      subtitle: input.subtitle || null,
      body: input.body,
      author_name: input.author_name,
      author_initial: input.author_initial || null,
      read_minutes: input.read_minutes,
      cover_url: input.cover_url,
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Article;
}

export async function deleteArticle(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) throw error;
}

export async function setPublished(id: string, published: boolean): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('articles')
    .update({
      published,
      ...(published ? { published_at: new Date().toISOString() } : {}),
    })
    .eq('id', id);
  if (error) throw error;
}

export async function setFeatured(id: string, featured: boolean): Promise<void> {
  const supabase = createAdminClient();
  if (featured) {
    const { error: clearErr } = await supabase
      .from('articles')
      .update({ featured: false })
      .eq('featured', true);
    if (clearErr) throw clearErr;
  }
  const { error } = await supabase.from('articles').update({ featured }).eq('id', id);
  if (error) throw error;
}

export async function uploadCover(file: File): Promise<string> {
  const supabase = createAdminClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;
  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(COVER_BUCKET)
    .upload(path, buffer, { contentType: file.type || 'image/jpeg', upsert: false });
  if (error) throw error;
  return supabase.storage.from(COVER_BUCKET).getPublicUrl(path).data.publicUrl;
}
