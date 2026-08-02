import 'server-only';

import { redirect } from 'next/navigation';

import { getCurrentAdmin } from '@/lib/auth/current-admin';

export async function requirePanelUser() {
  const user = await getCurrentAdmin();
  if (!user) redirect('/login');
  if (!user.isAdmin && !user.isBlogger) redirect('/403');
  return user;
}

export async function requireAdminPage() {
  const user = await getCurrentAdmin();
  if (!user) redirect('/login');
  if (user.isAdmin) return user;
  if (user.isBlogger) redirect('/blog');
  redirect('/403');
}
