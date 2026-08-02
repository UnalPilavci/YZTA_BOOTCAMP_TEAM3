import { supabase } from './client';

export type FeedbackCategory = 'bug' | 'suggestion' | 'content' | 'other';

export async function submitFeedback(input: {
  userId: string;
  category: FeedbackCategory;
  message: string;
  email?: string;
  appVersion?: string;
}): Promise<void> {
  const { error } = await supabase.from('feedback').insert({
    user_id: input.userId,
    category: input.category,
    message: input.message.trim(),
    email: input.email?.trim() || null,
    app_version: input.appVersion ?? null,
  });
  if (error) throw error;
}
