'use client';

import { Loader2 } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { login, type LoginState } from './actions';

const initial: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initial);

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink">
            <span className="text-lg font-bold text-lime">N</span>
          </div>
          <h1 className="text-xl font-semibold text-ink">NutriLens Admin</h1>
          <p className="mt-1 text-sm text-muted">Yönetim paneline giriş yap</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </div>

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
          )}

          <SubmitButton />
        </form>
      </div>
    </main>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-semibold text-lime disabled:opacity-60">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Giriş yap
    </button>
  );
}
