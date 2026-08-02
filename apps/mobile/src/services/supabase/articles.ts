import { supabase } from './client';

export type ArticleCategory =
  | 'recipes'
  | 'nutrition'
  | 'fitness'
  | 'wellness'
  | 'allergies'
  | 'weight'
  | 'science';

export type Article = {
  id: string;
  category: ArticleCategory;
  title: string;
  subtitle: string | null;
  body: string;
  authorName: string;
  authorInitial: string | null;
  readMinutes: number;
  featured: boolean;
};

type ArticleRow = {
  id: string;
  category: ArticleCategory;
  title: string;
  subtitle: string | null;
  body: string;
  author_name: string;
  author_initial: string | null;
  read_minutes: number;
  featured: boolean;
};

const COLUMNS =
  'id, category, title, subtitle, body, author_name, author_initial, read_minutes, featured';

function fromRow(row: ArticleRow): Article {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    subtitle: row.subtitle,
    body: row.body ?? '',
    authorName: row.author_name,
    authorInitial: row.author_initial,
    readMinutes: row.read_minutes,
    featured: row.featured,
  };
}

export async function fetchArticles(limit = 50): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(COLUMNS)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data as ArticleRow[] | null)?.map(fromRow) ?? [];
}

export async function fetchArticle(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as ArticleRow) : null;
}
