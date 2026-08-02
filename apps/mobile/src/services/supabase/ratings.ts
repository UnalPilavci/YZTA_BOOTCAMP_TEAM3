import { supabase } from './client';

export type ArticleRating = {
  average: number;
  count: number;
  mine: number;
};

export type MyRatingView = {
  articleId: string;
  rating: number;
  ratedAt: number;
  title: string;
  category: string;
  authorName: string;
  readMinutes: number;
};

export async function fetchArticleRating(articleId: string, myId: string): Promise<ArticleRating> {
  const [agg, mine] = await Promise.all([
    supabase.from('articles').select('rating_sum, rating_count').eq('id', articleId).maybeSingle(),
    supabase
      .from('article_ratings')
      .select('rating')
      .eq('article_id', articleId)
      .eq('user_id', myId)
      .maybeSingle(),
  ]);
  if (agg.error) throw agg.error;
  if (mine.error) throw mine.error;
  const sum = (agg.data as { rating_sum: number } | null)?.rating_sum ?? 0;
  const count = (agg.data as { rating_count: number } | null)?.rating_count ?? 0;
  return {
    average: count > 0 ? sum / count : 0,
    count,
    mine: (mine.data as { rating: number } | null)?.rating ?? 0,
  };
}

export async function rateArticle(articleId: string, myId: string, rating: number): Promise<void> {
  const { error } = await supabase
    .from('article_ratings')
    .upsert(
      { article_id: articleId, user_id: myId, rating, updated_at: new Date().toISOString() },
      { onConflict: 'article_id,user_id' },
    );
  if (error) throw error;
}

export async function removeArticleRating(articleId: string, myId: string): Promise<void> {
  const { error } = await supabase
    .from('article_ratings')
    .delete()
    .eq('article_id', articleId)
    .eq('user_id', myId);
  if (error) throw error;
}

type MyRatingRow = {
  rating: number;
  updated_at: string;
  articles: {
    id: string;
    title: string;
    category: string;
    author_name: string;
    read_minutes: number;
  } | null;
};

export async function fetchMyRatings(myId: string, limit = 60): Promise<MyRatingView[]> {
  const { data, error } = await supabase
    .from('article_ratings')
    .select('rating, updated_at, articles!inner(id, title, category, author_name, read_minutes)')
    .eq('user_id', myId)
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data as unknown as MyRatingRow[] | null) ?? [])
    .filter((r) => r.articles != null)
    .map((r) => ({
      articleId: r.articles!.id,
      rating: r.rating,
      ratedAt: Date.parse(r.updated_at),
      title: r.articles!.title,
      category: r.articles!.category,
      authorName: r.articles!.author_name,
      readMinutes: r.articles!.read_minutes,
    }));
}
