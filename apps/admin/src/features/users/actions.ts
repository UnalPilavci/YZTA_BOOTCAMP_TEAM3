'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { assertAdmin } from '@/lib/auth/assert-admin';
import { writeAudit } from '@/lib/audit';
import {
  deleteUser,
  setAdmin,
  setBanned,
  setBlogger,
  setPlan,
  setTrainer,
  type PlanId,
} from '@/features/users/service';

function revalidateUser(id: string) {
  revalidatePath('/users');
  revalidatePath(`/users/${id}`);
}

export async function setPlanAction(id: string, plan: PlanId): Promise<void> {
  const { actorId } = await assertAdmin();
  await setPlan(id, plan);
  await writeAudit({ actorId, action: 'user.plan_change', entity: 'profiles', entityId: id, diff: { plan } });
  revalidateUser(id);
}

export async function setTrainerAction(id: string, isTrainer: boolean): Promise<void> {
  const { actorId } = await assertAdmin();
  await setTrainer(id, isTrainer);
  await writeAudit({
    actorId,
    action: isTrainer ? 'user.trainer_grant' : 'user.trainer_revoke',
    entity: 'profiles',
    entityId: id,
  });
  revalidateUser(id);
}

export async function setAdminAction(id: string, isAdmin: boolean): Promise<void> {
  const { actorId } = await assertAdmin();
  if (id === actorId && !isAdmin) {
    throw new Error('Kendi admin yetkini kaldıramazsın.');
  }
  await setAdmin(id, isAdmin);
  await writeAudit({
    actorId,
    action: isAdmin ? 'user.admin_grant' : 'user.admin_revoke',
    entity: 'profiles',
    entityId: id,
  });
  revalidateUser(id);
}

export async function setBloggerAction(id: string, isBlogger: boolean): Promise<void> {
  const { actorId } = await assertAdmin();
  await setBlogger(id, isBlogger);
  await writeAudit({
    actorId,
    action: isBlogger ? 'user.blogger_grant' : 'user.blogger_revoke',
    entity: 'profiles',
    entityId: id,
  });
  revalidateUser(id);
}

export async function setBannedAction(id: string, banned: boolean): Promise<void> {
  const { actorId } = await assertAdmin();
  if (id === actorId) throw new Error('Kendini askıya alamazsın.');
  await setBanned(id, banned);
  await writeAudit({
    actorId,
    action: banned ? 'user.ban' : 'user.unban',
    entity: 'auth.users',
    entityId: id,
  });
  revalidateUser(id);
}

export async function deleteUserAction(id: string): Promise<void> {
  const { actorId } = await assertAdmin();
  if (id === actorId) throw new Error('Kendi hesabını buradan silemezsin.');
  await deleteUser(id);
  await writeAudit({ actorId, action: 'user.delete', entity: 'auth.users', entityId: id });
  revalidatePath('/users');
  redirect('/users');
}
