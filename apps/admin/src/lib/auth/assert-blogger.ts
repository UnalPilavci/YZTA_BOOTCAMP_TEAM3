import 'server-only';

import { getCurrentAdmin } from '@/lib/auth/current-admin';

export async function assertBlogger(): Promise<{ actorId: string }> {
  const user = await getCurrentAdmin();
  if (!user || (!user.isAdmin && !user.isBlogger)) {
    throw new Error('Yetkisiz: bu işlem için admin veya blog yazarı olmalısınız.');
  }
  return { actorId: user.id };
}
