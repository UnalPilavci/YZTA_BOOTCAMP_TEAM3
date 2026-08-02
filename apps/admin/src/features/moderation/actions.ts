'use server';

import { revalidatePath } from 'next/cache';

import { assertAdmin } from '@/lib/auth/assert-admin';
import { writeAudit } from '@/lib/audit';
import {
  deleteComment,
  deletePost,
  setReportStatus,
  type ReportStatus,
} from '@/features/moderation/service';

export async function deletePostAction(id: string): Promise<void> {
  const { actorId } = await assertAdmin();
  await deletePost(id);
  await writeAudit({ actorId, action: 'post.delete', entity: 'posts', entityId: id });
  revalidatePath('/community');
}

export async function deleteCommentAction(id: string): Promise<void> {
  const { actorId } = await assertAdmin();
  await deleteComment(id);
  await writeAudit({ actorId, action: 'comment.delete', entity: 'post_comments', entityId: id });
  revalidatePath('/community');
}

export async function setReportStatusAction(id: string, status: ReportStatus): Promise<void> {
  const { actorId } = await assertAdmin();
  await setReportStatus(id, status);
  await writeAudit({
    actorId,
    action: `report.${status}`,
    entity: 'content_reports',
    entityId: id,
  });
  revalidatePath('/community');
}
