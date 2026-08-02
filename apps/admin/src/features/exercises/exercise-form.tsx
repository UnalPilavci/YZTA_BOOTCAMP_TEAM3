'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button, Field, Input, Select, Textarea } from '@/components/ui';
import type { Exercise, ExerciseCategory } from '@/features/exercises/service';

export function ExerciseForm({
  action,
  categories,
  exercise,
}: {
  action: (formData: FormData) => void | Promise<void>;
  categories: ExerciseCategory[];
  exercise?: Exercise;
}) {
  const [image, setImage] = useState<string | null>(exercise?.image_url ?? null);
  const isNew = !exercise;

  return (
    <form action={action} className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
      <input type="hidden" name="is_new" value={isNew ? '1' : '0'} />
      {!isNew && <input type="hidden" name="id" value={exercise.id} />}

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ad (TR)">
            <Input name="name_tr" defaultValue={exercise?.name_tr} required />
          </Field>
          <Field label="Ad (EN)">
            <Input name="name_en" defaultValue={exercise?.name_en} required />
          </Field>
        </div>

        <Field label="Adımlar (TR)" hint="Her satır bir adım.">
          <Textarea
            name="instructions_tr"
            rows={6}
            defaultValue={exercise?.instructions_tr.join('\n')}
          />
        </Field>
        <Field label="Adımlar (EN)" hint="One step per line.">
          <Textarea
            name="instructions_en"
            rows={6}
            defaultValue={exercise?.instructions_en.join('\n')}
          />
        </Field>
      </div>

      <aside className="space-y-5">
        <div className="rounded-xl border border-line bg-white p-4 space-y-4">
          {isNew && (
            <Field label="Kimlik (slug)" hint="ör. pushup — sonradan değişmez.">
              <Input name="id" placeholder="pushup" required />
            </Field>
          )}
          <Field label="Kategori">
            <Select name="category_id" defaultValue={exercise?.category_id ?? categories[0]?.id} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label_tr}
                  {!c.active ? ' (pasif)' : ''}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="MET" hint="Kalori için">
              <Input name="met" type="number" step="0.1" min={0} defaultValue={exercise?.met ?? 3.5} />
            </Field>
            <Field label="Sıra">
              <Input name="sort_order" type="number" defaultValue={exercise?.sort_order ?? 0} />
            </Field>
          </div>
          <Field label="Zorluk">
            <Select name="difficulty" defaultValue={exercise?.difficulty ?? 'beginner'}>
              <option value="beginner">Başlangıç</option>
              <option value="intermediate">Orta</option>
              <option value="advanced">İleri</option>
            </Select>
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="active" defaultChecked={exercise?.active ?? true} /> Aktif
          </label>
        </div>

        <div className="rounded-xl border border-line bg-white p-4 space-y-3">
          <span className="text-sm font-medium text-ink">Görsel / GIF</span>
          {image ? (
            <div>
              <Image
                src={image}
                alt="egzersiz"
                width={288}
                height={160}
                className="h-40 w-full rounded-lg object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="mt-2 text-xs text-red-600 hover:underline">
                Görseli kaldır
              </button>
            </div>
          ) : (
            <p className="text-xs text-muted">Görsel yok.</p>
          )}
          <input type="hidden" name="image_url" value={image ?? ''} />
          <input
            type="file"
            name="image"
            accept="image/*"
            className="block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:text-lime"
          />
        </div>

        <SubmitButton isEdit={!isNew} />
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
