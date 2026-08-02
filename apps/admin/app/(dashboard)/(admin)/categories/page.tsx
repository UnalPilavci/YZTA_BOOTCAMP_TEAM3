import { PageHeader } from '@/components/ui';
import { CategoryManager } from '@/features/categories/manager';
import { listCategories } from '@/features/categories/service';
import { assertAdmin } from '@/lib/auth/assert-admin';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  await assertAdmin();
  const categories = await listCategories();

  return (
    <div className="px-8 py-8">
      <PageHeader
        title="Kategoriler"
        subtitle="Blog kategorileri — mobil uygulama aktif olanları gösterir."
      />
      <CategoryManager categories={categories} />
      <p className="mt-6 text-xs text-muted">
        Not: Yeni bir kategori eklersen mobil uygulamanın onu render edebilmesi için
        istemci tarafı kategori okuması (F3) gerekir; mevcut 7 kategori uyumludur.
      </p>
    </div>
  );
}
