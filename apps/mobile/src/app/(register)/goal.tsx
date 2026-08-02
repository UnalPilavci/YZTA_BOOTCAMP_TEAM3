import { useRouter } from 'expo-router';
import { ArrowRight, Equal, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { GoalCard } from '@/components/profile/goal-card';
import { AllergenChip } from '@/components/register/allergen-chip';
import { RegisterScaffold } from '@/components/register/register-scaffold';
import {
  ACTIVITY_LEVELS,
  SEXES,
  type ActivityLevel,
  type Goal,
  type Sex,
} from '@/data/nutrition-targets';
import { useProfile } from '@/store/profile';

const GOAL_ICONS: Record<Goal, LucideIcon> = {
  lose: TrendingDown,
  maintain: Equal,
  gain: TrendingUp,
};
const GOAL_ORDER: Goal[] = ['lose', 'maintain', 'gain'];

export default function GoalScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setGoalInfo = useProfile((s) => s.setGoalInfo);

  const [sex, setSex] = useState<Sex | null>(useProfile.getState().sex);
  const [goal, setGoal] = useState<Goal>(useProfile.getState().goal ?? 'maintain');
  const [activity, setActivity] = useState<ActivityLevel>(
    useProfile.getState().activityLevel ?? 'moderate',
  );

  const next = () => {
    setGoalInfo({ sex, goal, activityLevel: activity });
    router.push('/conditions');
  };

  return (
    <RegisterScaffold
      kicker={t('register.kickerGoal')}
      step={2}
      totalSteps={7}
      onBack={() => router.back()}
      title={t('register.goal.title')}
      subtitle={t('register.goal.subtitle')}
      primaryLabel={t('common.continue')}
      onPrimary={next}
      PrimaryIcon={ArrowRight}>
      <View className="gap-6">
        <View className="gap-2.5">
          <Label text={t('register.goal.sexLabel')} />
          <View className="flex-row gap-2.5">
            {SEXES.map((s) => (
              <AllergenChip
                key={s}
                label={t(`options.sex.${s}`)}
                selected={sex === s}
                onPress={() => setSex(sex === s ? null : s)}
              />
            ))}
          </View>
        </View>

        <View className="gap-2.5">
          <Label text={t('register.goal.goalLabel')} />
          <View className="gap-2.5">
            {GOAL_ORDER.map((g) => (
              <GoalCard
                key={g}
                Icon={GOAL_ICONS[g]}
                title={t(`options.goal.${g}`)}
                desc={t(`options.goalDesc.${g}`)}
                selected={goal === g}
                onPress={() => setGoal(g)}
              />
            ))}
          </View>
        </View>

        <View className="gap-2.5">
          <Label text={t('register.goal.activityLabel')} />
          <View className="flex-row flex-wrap gap-2.5">
            {ACTIVITY_LEVELS.map((a) => (
              <AllergenChip
                key={a}
                label={t(`options.activity.${a}`)}
                selected={activity === a}
                onPress={() => setActivity(a)}
              />
            ))}
          </View>
        </View>
      </View>
    </RegisterScaffold>
  );
}

function Label({ text }: { text: string }) {
  return (
    <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">{text}</Text>
  );
}
