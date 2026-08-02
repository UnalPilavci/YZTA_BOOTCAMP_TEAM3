import 'server-only';

import { getCurrentAdmin } from '@/lib/auth/current-admin';

export async function assertAdmin(): Promise<{ actorId: string }> {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.isAdmin) {
    throw new Error('Yetkisiz: bu işlem için admin olmalısınız.');
  }
  return { actorId: admin.id };
}
