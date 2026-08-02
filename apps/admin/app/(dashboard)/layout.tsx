import { signOut } from '@/lib/actions/sign-out';
import { Nav } from '@/components/nav';
import { requirePanelUser } from '@/lib/auth/guards';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requirePanelUser();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col justify-between bg-ink">
        <div>
          <div className="flex items-center gap-2 px-5 py-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime">
              <span className="text-sm font-bold text-lime-on">N</span>
            </div>
            <span className="font-semibold text-white">NutriLens Admin</span>
          </div>
          <Nav isAdmin={admin.isAdmin} />
        </div>
        <div className="border-t border-white/10 px-5 py-4">
          <p className="mb-2 truncate text-xs text-white/50">{admin.email}</p>
          <form action={signOut}>
            <button className="text-sm text-white/70 hover:text-white">Çıkış yap</button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden bg-cream">{children}</main>
    </div>
  );
}
