import { supabase } from './client';

export type NewsletterTopic = 'recipes' | 'tips' | 'contests' | 'features';

export type NewsletterSub = {
  subscribed: boolean;
  topics: NewsletterTopic[];
  email: string;
};

export async function fetchNewsletter(userId: string): Promise<NewsletterSub | null> {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('subscribed, topics, email')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    subscribed: data.subscribed,
    topics: (data.topics ?? []) as NewsletterTopic[],
    email: data.email ?? '',
  };
}

export async function saveNewsletter(userId: string, sub: NewsletterSub): Promise<void> {
  const { error } = await supabase.from('newsletter_subscribers').upsert(
    {
      user_id: userId,
      email: sub.email.trim(),
      subscribed: sub.subscribed,
      topics: sub.topics,
    },
    { onConflict: 'user_id' },
  );
  if (error) throw error;
}
