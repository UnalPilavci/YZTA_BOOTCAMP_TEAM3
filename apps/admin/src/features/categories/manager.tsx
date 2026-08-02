'use client';

import { ChevronDown, Plus } from 'lucide-react';
import { useState, useTransition } from 'react';

import { Badge, Button, Field, Input } from '@/components/ui';
import { saveCategoryAction, toggleCategoryActiveAction } from '@/features/categories/actions';
import type { BlogCategory } from '@/features/categories/service';

export function CategoryManager({ categories }: { categories: BlogCategory[] }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="secondary" onClick={() => setAdding((v) => !v)}>
          <Plus className="h-4 w-4" /> Yeni kategori
        </Button>
      </div>

      {adding && (
        <div className="rounded-xl border border-line bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-ink">Yeni kategori</h3>
          <CategoryForm isNew onDone={() => setAdding(false)} />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-cream/60 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Kimlik</th>
              <th className="px-4 py-3 font-medium">Sıra</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
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
  category: BlogCategory;
  open: boolean;
  onToggle: () => void;
}) {
  const [pending, start] = useTransition();
  return (
    <>
      <tr className="hover:bg-cream/40">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
            <span className="font-medium text-ink">{category.label_tr}</span>
            <span className="text-muted">/ {category.label_en}</span>
          </div>
        </td>
        <td className="px-4 py-3 font-mono text-xs text-muted">{category.id}</td>
        <td className="px-4 py-3 tabular-nums text-muted">{category.sort_order}</td>
        <td className="px-4 py-3">
          {category.active ? <Badge color="#16A34A">Aktif</Badge> : <Badge color="#9CA3AF">Pasif</Badge>}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => start(() => toggleCategoryActiveAction(category.id, !category.active))}>
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
          <td colSpan={5} className="bg-cream/40 px-4 py-4">
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
  category?: BlogCategory;
  isNew?: boolean;
  onDone: () => void;
}) {
  const [pending, start] = useTransition();

  return (
    <form
      action={(fd) => start(async () => {
        await saveCategoryAction(fd);
        onDone();
      })}
      className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <input type="hidden" name="is_new" value={isNew ? '1' : '0'} />
      <Field label={isNew ? 'Kimlik (slug)' : 'Kimlik'}>
        <Input name="id" defaultValue={category?.id} readOnly={!isNew} required placeholder="ör. detox" />
      </Field>
      <Field label="Etiket (TR)">
        <Input name="label_tr" defaultValue={category?.label_tr} required />
      </Field>
      <Field label="Etiket (EN)">
        <Input name="label_en" defaultValue={category?.label_en} required />
      </Field>
      <Field label="Renk (hex)">
        <Input name="color" defaultValue={category?.color ?? '#64748B'} />
      </Field>
      <Field label="İkon (lucide adı)">
        <Input name="icon" defaultValue={category?.icon ?? 'Tag'} />
      </Field>
      <Field label="Sıra">
        <Input name="sort_order" type="number" defaultValue={category?.sort_order ?? 0} />
      </Field>
      <label className="flex items-end gap-2 pb-2 text-sm text-ink">
        <input type="checkbox" name="active" defaultChecked={category?.active ?? true} /> Aktif
      </label>
      <div className="flex items-end">
        <Button type="submit" size="sm" disabled={pending} className="w-full">
          Kaydet
        </Button>
      </div>
    </form>
  );
}
