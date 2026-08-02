import {
  Activity,
  Dumbbell,
  Flame,
  Footprints,
  Move,
  MoveUp,
  MoveVertical,
  PersonStanding,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'cardio';

export const EXERCISE_ICON_BY_NAME: Record<string, LucideIcon> = {
  Dumbbell,
  MoveVertical,
  MoveUp,
  Activity,
  Zap,
  Footprints,
  Move,
  PersonStanding,
  Flame,
};

export const CATEGORY_META: Record<
  ExerciseCategory,
  { Icon: LucideIcon; color: string; tint: string; labelKey: string }
> = {
  chest: { Icon: Dumbbell, color: '#E8724C', tint: '#FBE7DE', labelKey: 'fitness.catChest' },
  back: { Icon: MoveVertical, color: '#4C86E8', tint: '#DEE9FB', labelKey: 'fitness.catBack' },
  shoulders: { Icon: MoveUp, color: '#2FAFC4', tint: '#DCF1F4', labelKey: 'fitness.catShoulders' },
  biceps: { Icon: Activity, color: '#7C5CE8', tint: '#E7E0FB', labelKey: 'fitness.catBiceps' },
  triceps: { Icon: Zap, color: '#C4562F', tint: '#F7E2D9', labelKey: 'fitness.catTriceps' },
  legs: { Icon: Footprints, color: '#F2A73B', tint: '#FBF0DC', labelKey: 'fitness.catLegs' },
  glutes: { Icon: Move, color: '#D2607A', tint: '#FBE1E8', labelKey: 'fitness.catGlutes' },
  core: { Icon: PersonStanding, color: '#8B7BF0', tint: '#E7E4FB', labelKey: 'fitness.catCore' },
  cardio: { Icon: Flame, color: '#E0483C', tint: '#FBDCDC', labelKey: 'fitness.catCardio' },
};

export type Exercise = {
  id: string;
  category: ExerciseCategory;
  met: number;
};

export const EXERCISES: Exercise[] = [
  { id: 'pushup', category: 'chest', met: 8.0 },
  { id: 'pull_up', category: 'back', met: 8.0 },
  { id: 'bent_over_row', category: 'back', met: 5.0 },
  { id: 'superman', category: 'back', met: 3.0 },
  { id: 'shoulder_press', category: 'shoulders', met: 5.0 },
  { id: 'lateral_raise', category: 'shoulders', met: 3.5 },
  { id: 'biceps_curl', category: 'biceps', met: 3.5 },
  { id: 'triceps_dips', category: 'triceps', met: 5.0 },
  { id: 'squat', category: 'legs', met: 5.0 },
  { id: 'lunge', category: 'legs', met: 4.5 },
  { id: 'calf_raise', category: 'legs', met: 3.0 },
  { id: 'glute_bridge', category: 'glutes', met: 3.5 },
  { id: 'donkey_kick', category: 'glutes', met: 3.5 },
  { id: 'fire_hydrant', category: 'glutes', met: 3.5 },
  { id: 'plank', category: 'core', met: 3.8 },
  { id: 'side_plank', category: 'core', met: 3.5 },
  { id: 'russian_twist', category: 'core', met: 4.0 },
  { id: 'bicycle_crunch', category: 'core', met: 5.0 },
  { id: 'reverse_crunch', category: 'core', met: 4.0 },
  { id: 'dead_bug', category: 'core', met: 3.0 },
  { id: 'bird_dog', category: 'core', met: 3.0 },
  { id: 'mountain_climber', category: 'cardio', met: 8.0 },
  { id: 'jumping_jack', category: 'cardio', met: 8.0 },
  { id: 'burpee', category: 'cardio', met: 10.0 },
];

export const CATEGORY_FILTERS: (ExerciseCategory | 'all')[] = [
  'all',
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'glutes',
  'core',
  'cardio',
];

export const DEFAULT_WEIGHT_KG = 70;

export function estimateCaloriesPerMinute(met: number, weightKg: number | null): number {
  const w = weightKg ?? DEFAULT_WEIGHT_KG;
  return (met * 3.5 * w) / 200;
}
