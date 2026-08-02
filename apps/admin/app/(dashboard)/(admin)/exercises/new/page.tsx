import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { PageHeader } from '@/components/ui';
import { saveExerciseAction } from '@/features/exercises/actions';
import { ExerciseForm } from '@/features/exercises/exercise-form';
import { listExerciseCategories } from '@/features/exercises/service';
import { assertAdmin } from '@/lib/auth/assert-admin';

export const dynamic = 'force-dynamic';

export default async function NewExercisePage() {
  await assertAdmin();
  const categories = await listExerciseCategories();

  return (
    <div className="px-8 py-8">
      <Link
        href="/exercises"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Spor Hareketleri
      </Link>
      <PageHeader title="Yeni egzersiz" />
      <ExerciseForm action={saveExerciseAction} categories={categories} />
    </div>
  );
}
