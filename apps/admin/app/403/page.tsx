import { signOut } from '@/lib/actions/sign-out';

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-2xl font-semibold text-ink">Erişim yok</h1>
        <p className="mt-2 text-sm text-muted">
          Bu hesabın yönetim paneline erişim yetkisi bulunmuyor.
        </p>
        <form action={signOut} className="mt-6">
          <button className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-lime">
            Çıkış yap
          </button>
        </form>
      </div>
    </main>
  );
}
