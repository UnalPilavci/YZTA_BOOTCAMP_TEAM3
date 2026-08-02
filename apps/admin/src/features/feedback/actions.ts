'use server';

import { revalidatePath } from 'next/cache';

import { deleteFeedback } from '@/features/feedback/service';
import { writeAudit } from '@/lib/audit';
import { assertAdmin } from '@/lib/auth/assert-admin';

export async function deleteFeedbackAction(id: string): Promise<void> {
  const { actorId } = await assertAdmin();
  await deleteFeedback(id);
  await writeAudit({ actorId, action: 'feedback.delete', entity: 'feedback', entityId: id });
  revalidatePath('/feedback');
}
