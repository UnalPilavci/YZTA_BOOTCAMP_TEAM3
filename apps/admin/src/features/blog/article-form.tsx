'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button, Field, Input, Select, Textarea } from '@/components/ui';
import type { Article } from '@/features/blog/service';
import type { BlogCategory } from '@/features/categories/service';

export function ArticleForm({
  action,
  categories,
  article,
}: {
  action: (formData: FormData) => void | Promise<void>;
  categories: BlogCategory[];
  article?: Article;
}) {
  const [cover, setCover] = useState<string | null>(article?.cover_url ?? null);

  return (
    <form action={action} className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Field label="Başlık">
          <Input name="title" defaultValue={article?.title ?? ''} required />
        </Field>
        <Field label="Alt başlık">
          <Input name="subtitle" defaultValue={article?.subtitle ?? ''} />
        </Field>
        <Field label="İçerik (Markdown)" hint="Markdown desteklenir.">
          <Textarea
            name="body"
            defaultValue={article?.body ?? ''}
            rows={18}
            className="font-mono text-[13px] leading-relaxed"
          />
        </Field>
      </div>

      <aside className="space-y-5">
        <div className="rounded-xl border border-line bg-white p-4 space-y-4">
          <Field label="Kategori">
            <Select name="category" defaultValue={article?.category ?? categories[0]?.id} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label_tr}
                  {!c.active ? ' (pasif)' : ''}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Yazar adı">
            <Input name="author_name" defaultValue={article?.author_name ?? ''} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Baş harf">
              <Input name="author_initial" maxLength={2} defaultValue={article?.author_initial ?? ''} />
            </Field>
            <Field label="Okuma (dk)">
              <Input
                name="read_minutes"
                type="number"
                min={1}
                defaultValue={article?.read_minutes ?? 3}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-4 space-y-3">
          <span className="text-sm font-medium text-ink">Kapak görseli</span>
          {cover ? (
            <div className="relative">
              <Image
                src={cover}
                alt="kapak"
                width={288}
                height={160}
                className="h-40 w-full rounded-lg object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setCover(null)}
                className="mt-2 text-xs text-red-600 hover:underline">
                Görseli kaldır
              </button>
            </div>
          ) : (
            <p className="text-xs text-muted">Görsel yok.</p>
          )}
          <input type="hidden" name="cover_url" value={cover ?? ''} />
          <input
            type="file"
            name="cover"
            accept="image/*"
            className="block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:text-lime"
          />
        </div>

        <SubmitButton isEdit={!!article} />
      </aside>
    </form>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {isEdit ? 'Kaydet' : 'Oluştur'}
    </Button>
  );
}
