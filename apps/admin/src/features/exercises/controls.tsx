'use client';

import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';

import { Badge, Button, Field, Input } from '@/components/ui';
import {
  deleteExerciseAction,
  saveExerciseCategoryAction,
  toggleExerciseCategoryActiveAction,
} from '@/features/exercises/actions';
import type { ExerciseCategory } from '@/features/exercises/service';

export function DeleteExerciseButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => confirm(`"${id}" silinsin mi?`) && start(() => deleteExerciseAction(id))}>
      <Trash2 className="h-3.5 w-3.5" /> Sil
    </Button>
  );
}

export function ExerciseCategoryManager({ categories }: { categories: ExerciseCategory[] }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Kategoriler</h2>
        <Button size="sm" variant="secondary" onClick={() => setAdding((v) => !v)}>
          <Plus className="h-4 w-4" /> Yeni
        </Button>
      </div>

      {adding && (
        <div className="rounded-xl border border-line bg-white p-4">
          <CategoryForm isNew onDone={() => setAdding(false)} />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-line">
            {categories.map((c) => (
              <RowGroup
                key={c.id}
                category={c}
                open={editing === c.id}
                onToggle={() => setEditing((e) => (e === c.id ? null : c.id))}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowGroup({
  category,
  open,
  onToggle,
}: {
  category: ExerciseCategory;
  open: boolean;
  onToggle: () => void;
}) {
  const [pending, start] = useTransition();
  return (
    <>
      <tr className="hover:bg-cream/40">
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
            <span className="font-medium text-ink">{category.label_tr}</span>
            <span className="text-muted">/ {category.label_en}</span>
            <span className="font-mono text-xs text-muted">({category.id})</span>
          </div>
        </td>
        <td className="px-4 py-2.5">
          {category.active ? <Badge color="#16A34A">Aktif</Badge> : <Badge color="#9CA3AF">Pasif</Badge>}
        </td>
        <td className="px-4 py-2.5">
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() =>
                start(() => toggleExerciseCategoryActiveAction(category.id, !category.active))
              }>
              {category.active ? 'Pasifleştir' : 'Aktifleştir'}
            </Button>
            <Button size="sm" variant="secondary" onClick={onToggle}>
              Düzenle <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={3} className="bg-cream/40 px-4 py-4">
            <CategoryForm category={category} onDone={onToggle} />
          </td>
        </tr>
      )}
    </>
  );
}

function CategoryForm({
  category,
  isNew,
  onDone,
}: {
  category?: ExerciseCategory;
  isNew?: boolean;
  onDone: () => void;
}) {
  const [pending, start] = useTransition();
  return (
    <form
      action={(fd) =>
        start(async () => {
          await saveExerciseCategoryAction(fd);
          onDone();
        })
      }
      className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <input type="hidden" name="is_new" value={isNew ? '1' : '0'} />
      <Field label="Kimlik">
        <Input name="id" defaultValue={category?.id} readOnly={!isNew} required />
      </Field>
      <Field label="Etiket (TR)">
        <Input name="label_tr" defaultValue={category?.label_tr} required />
      </Field>
      <Field label="Etiket (EN)">
        <Input name="label_en" defaultValue={category?.label_en} required />
      </Field>
      <Field label="Renk">
        <Input name="color" defaultValue={category?.color ?? '#64748B'} />
      </Field>
      <Field label="Tint">
        <Input name="tint" defaultValue={category?.tint ?? '#E7EAEE'} />
      </Field>
      <Field label="İkon (lucide)">
        <Input name="icon" defaultValue={category?.icon ?? 'Dumbbell'} />
      </Field>
      <Field label="Sıra">
        <Input name="sort_order" type="number" defaultValue={category?.sort_order ?? 0} />
      </Field>
      <label className="flex items-end gap-2 pb-2 text-sm text-ink">
        <input type="checkbox" name="active" defaultChecked={category?.active ?? true} /> Aktif
      </label>
      <div className="md:col-span-4">
        <Button type="submit" size="sm" disabled={pending}>
          Kaydet
        </Button>
      </div>
    </form>
  );
}
