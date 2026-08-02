import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ImageSourcePropType } from 'react-native';

import { EXERCISE_IMAGES } from '@/data/exercise-images';
import {
  CATEGORY_FILTERS,
  CATEGORY_META,
  EXERCISE_ICON_BY_NAME,
  EXERCISES,
  type ExerciseCategory,
} from '@/data/exercises';
import { useExercisesStore } from '@/store/exercises';
import type { LucideIcon } from 'lucide-react-native';

export type ImageSrc = ImageSourcePropType | undefined;

export type ResolvedCategory = {
  id: string;
  label: string;
  color: string;
  tint: string;
  Icon: LucideIcon;
};

export type ResolvedExercise = {
  id: string;
  categoryId: string;
  met: number;
  name: string;
  steps: string[];
  image: ImageSrc;
};

export type ResolvedLibrary = {
  categories: ResolvedCategory[];
  exercises: ResolvedExercise[];
  fromServer: boolean;
};

function resolveImage(id: string, imageUrl: string | null): ImageSrc {
  const local = EXERCISE_IMAGES[id];
  if (local != null) return local;
  return imageUrl ? { uri: imageUrl } : undefined;
}

export function useExerciseLibrary(): ResolvedLibrary {
  const { t, i18n } = useTranslation();
  const isTr = i18n.language.toLowerCase().startsWith('tr');
  const serverCategories = useExercisesStore((s) => s.categories);
  const serverExercises = useExercisesStore((s) => s.exercises);

  return useMemo(() => {
    if (serverExercises.length > 0) {
      const categories: ResolvedCategory[] = serverCategories.map((c) => ({
        id: c.id,
        label: isTr ? c.labelTr : c.labelEn,
        color: c.color,
        tint: c.tint,
        Icon: EXERCISE_ICON_BY_NAME[c.icon] ?? EXERCISE_ICON_BY_NAME.Dumbbell,
      }));
      const exercises: ResolvedExercise[] = serverExercises.map((e) => ({
        id: e.id,
        categoryId: e.categoryId,
        met: e.met,
        name: isTr ? e.nameTr : e.nameEn,
        steps: isTr ? e.instructionsTr : e.instructionsEn,
        image: resolveImage(e.id, e.imageUrl),
      }));
      return { categories, exercises, fromServer: true };
    }

    const categories: ResolvedCategory[] = (
      CATEGORY_FILTERS.filter((c) => c !== 'all') as ExerciseCategory[]
    ).map((id) => {
      const meta = CATEGORY_META[id];
      return { id, label: t(meta.labelKey), color: meta.color, tint: meta.tint, Icon: meta.Icon };
    });
    const exercises: ResolvedExercise[] = EXERCISES.map((e) => {
      const raw = t(`exercises.${e.id}.steps`, { returnObjects: true });
      return {
        id: e.id,
        categoryId: e.category,
        met: e.met,
        name: t(`exercises.${e.id}.name`),
        steps: Array.isArray(raw) ? (raw as string[]) : [],
        image: resolveImage(e.id, null),
      };
    });
    return { categories, exercises, fromServer: false };
  }, [serverCategories, serverExercises, isTr, t]);
}
