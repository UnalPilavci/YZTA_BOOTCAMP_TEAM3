import { supabase } from './client';

export type ReportTargetType = 'post' | 'comment' | 'user' | 'listing';

export async function createReport(
  reporterId: string,
  targetType: ReportTargetType,
  targetId: string,
  reason: string,
): Promise<void> {
  const { error } = await supabase.from('content_reports').insert({
    reporter_id: reporterId,
    target_type: targetType,
    target_id: targetId,
    reason,
  });
  if (error) throw error;
}
