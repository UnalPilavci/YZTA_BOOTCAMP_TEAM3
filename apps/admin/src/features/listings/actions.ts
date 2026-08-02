'use server';

import { revalidatePath } from 'next/cache';

import { assertAdmin } from '@/lib/auth/assert-admin';
import { writeAudit } from '@/lib/audit';
import { deleteListing } from '@/features/listings/service';

export async function deleteListingAction(id: string): Promise<void> {
  const { actorId } = await assertAdmin();
  await deleteListing(id);
  await writeAudit({ actorId, action: 'listing.delete', entity: 'trainer_listings', entityId: id });
  revalidatePath('/listings');
}
