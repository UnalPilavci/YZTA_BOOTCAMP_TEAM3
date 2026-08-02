import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Dumbbell, Flame } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlanGate } from '@/components/ui/plan-gate';
import { PressableScale } from '@/components/ui/pressable-scale';
import { estimateCaloriesPerMinute } from '@/data/exercises';
import { requiredPlanFor } from '@/data/plans';
import { useExerciseLibrary } from '@/hooks/use-exercise-library';
import { useHasFeature } from '@/hooks/use-plan';
import { useProfile } from '@/store/profile';
import { useThemeColors } from '@/theme';

const REFERENCE_MINUTES = 10;

export default function ExerciseDetailRoute() {
  const { t } = useTranslation();
  const unlocked = useHasFeature('fitness');

  if (!unlocked) {
    return (
      <PlanGate
        Icon={Dumbbell}
        title={t('plans.lockedFitnessTitle')}
        message={t('plans.lockedFitnessMessage')}
        requiredPlan={requiredPlanFor('fitness')}
      />
    );
  }
  return <ExerciseDetailScreen />;
}

function ExerciseDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const weightKgRaw = useProfile((s) => s.weightKg);

  const { categories, exercises } = useExerciseLibrary();
  const exercise = exercises.find((e) => e.id === id);

  if (!exercise) {
    return (
      <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
        <SafeAreaView edges={['top', 'bottom']} className="flex-1 items-center justify-center px-8 gap-3">
          <Text className="font-heading text-lg text-ink dark:text-ink-dark text-center">
            {t('fitness.exerciseMissing')}
          </Text>
          <PressableScale haptic="light" onPress={() => router.back()}>
            <Text className="font-body-medium text-[15px]" style={{ color: colors.text }}>
              {t('common.back')}
            </Text>
          </PressableScale>
        </SafeAreaView>
      </View>
    );
  }

  const weightKg = weightKgRaw ? Number.parseInt(weightKgRaw, 10) : null;
  const kcal = Math.round(
    estimateCaloriesPerMinute(exercise.met, Number.isFinite(weightKg) ? weightKg : null) *
      REFERENCE_MINUTES,
  );
  const category = categories.find((c) => c.id === exercise.categoryId);
  const steps = exercise.steps;

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-2">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </PressableScale>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-4 pb-10 gap-4">
          <View className="h-[240px] rounded-[24px] overflow-hidden items-center justify-center bg-[#0E1114]">
            <Image
              source={exercise.image}
              contentFit="contain"
              style={{ width: '100%', height: '100%' }}
            />
          </View>

          {category && (
            <View
              className="self-start flex-row items-center gap-1.5 rounded-pill px-3 py-1"
              style={{ backgroundColor: category.tint }}>
              <category.Icon size={14} color={category.color} />
              <Text
                className="font-body-bold text-[10px] tracking-wider"
                style={{ color: category.color }}>
                {category.label.toLocaleUpperCase('tr')}
              </Text>
            </View>
          )}

          <Text className="font-heading text-[26px] leading-[32px] text-ink dark:text-ink-dark">
            {exercise.name}
          </Text>

          <View className="flex-row items-center gap-3 p-3.5 rounded-2xl bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
            <View
              className="w-11 h-11 rounded-xl items-center justify-center"
              style={{ backgroundColor: '#F2A73B22' }}>
              <Flame size={20} color="#F2A73B" />
            </View>
            <View className="flex-1">
              <Text className="font-heading text-[15px] text-ink dark:text-ink-dark">
                {t('fitness.kcalEstimate', { count: kcal, minutes: REFERENCE_MINUTES })}
              </Text>
              <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted mt-0.5">
                {weightKg ? t('fitness.kcalPersonalized') : t('fitness.kcalAverage')}
              </Text>
            </View>
          </View>

          <View className="h-px bg-border dark:bg-border-dark" />

          <View className="gap-3">
            <Text className="font-body-medium text-[13px] tracking-wider uppercase text-ink-muted dark:text-ink-dark-muted">
              {t('fitness.howTo')}
            </Text>
            {steps.map((step, i) => (
              <View key={i} className="flex-row items-start gap-3">
                <View className="w-6 h-6 rounded-full items-center justify-center bg-brand-tint dark:bg-brand-dark-tint mt-0.5">
                  <Text className="font-body-bold text-[12px] text-brand dark:text-brand-dark">
                    {i + 1}
                  </Text>
                </View>
                <Text className="flex-1 font-body text-[15px] leading-[22px] text-ink dark:text-ink-dark">
                  {step}
                </Text>
              </View>
            ))}
          </View>

          <Text className="font-body text-xs leading-4 text-center text-ink-muted dark:text-ink-dark-muted mt-2">
            {t('fitness.kcalDisclaimer')}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
