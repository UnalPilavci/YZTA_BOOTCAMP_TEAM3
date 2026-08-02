import { requireAdminPage } from '@/lib/auth/guards';

export default async function AdminOnlyLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <>{children}</>;
}
