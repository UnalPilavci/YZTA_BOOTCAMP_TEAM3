import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/ui';
import { saveExerciseAction } from '@/features/exercises/actions';
import { DeleteExerciseButton } from '@/features/exercises/controls';
import { ExerciseForm } from '@/features/exercises/exercise-form';
import { getExercise, listExerciseCategories } from '@/features/exercises/service';
import { assertAdmin } from '@/lib/auth/assert-admin';

export const dynamic = 'force-dynamic';

export default async function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  await assertAdmin();
  const { id } = await params;
  const [exercise, categories] = await Promise.all([getExercise(id), listExerciseCategories()]);
  if (!exercise) notFound();

  return (
    <div className="px-8 py-8">
      <Link
        href="/exercises"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Spor Hareketleri
      </Link>
      <PageHeader
        title={exercise.name_tr}
        subtitle={exercise.id}
        action={<DeleteExerciseButton id={exercise.id} />}
      />
      <ExerciseForm action={saveExerciseAction} categories={categories} exercise={exercise} />
    </div>
  );
}
