import { useRouter } from 'expo-router';
import { Equal, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';

import { EditScaffold } from '@/components/profile/edit-scaffold';
import { GoalCard } from '@/components/profile/goal-card';
import { AllergenChip } from '@/components/register/allergen-chip';
import { BirthDateField } from '@/components/register/birth-date-field';
import { TextField } from '@/components/register/text-field';
import {
  ACTIVITY_LEVELS,
  SEXES,
  type ActivityLevel,
  type Goal,
  type Sex,
} from '@/data/nutrition-targets';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';

const onlyDigits = (s: string) => s.replace(/[^0-9]/g, '');

const GOAL_ICONS: Record<Goal, LucideIcon> = {
  lose: TrendingDown,
  maintain: Equal,
  gain: TrendingUp,
};
const GOAL_ORDER: Goal[] = ['lose', 'maintain', 'gain'];

export default function EditGoalScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [sex, setSex] = useState<Sex | null>(useProfile.getState().sex);
  const [birthDate, setBirthDate] = useState<string | null>(useProfile.getState().birthDate);
  const [goal, setGoal] = useState<Goal | null>(useProfile.getState().goal);
  const [activity, setActivity] = useState<ActivityLevel | null>(
    useProfile.getState().activityLevel,
  );
  const [targetWeight, setTargetWeight] = useState(useProfile.getState().targetWeightKg);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    useProfile.getState().setGoalInfo({
      sex,
      birthDate,
      goal,
      activityLevel: activity,
      targetWeightKg: targetWeight.trim(),
    });
    const uid = useAuth.getState().userId;
    if (!uid) return router.back();
    setSaving(true);
    try {
      await useProfile.getState().saveToServer(uid);
      router.back();
    } catch {
      Alert.alert(t('profile.editSaveFailed'));
      setSaving(false);
    }
  };

  return (
    <EditScaffold
      kicker={t('goal.editKicker')}
      title={t('goal.editTitle')}
      subtitle={t('goal.editSubtitle')}
      onBack={() => router.back()}
      saveLabel={t('common.save')}
      onSave={onSave}
      saving={saving}>
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

        <BirthDateField
          label={t('register.account.birthDate')}
          hint={t('register.account.optional')}
          value={birthDate}
          onChange={setBirthDate}
        />

        <View className="w-40">
          <TextField
            label={t('goal.targetWeightLabel')}
            value={targetWeight}
            onChangeText={(v) => setTargetWeight(onlyDigits(v))}
            placeholder="70"
            keyboardType="number-pad"
            maxLength={3}
          />
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
                onPress={() => setGoal(goal === g ? null : g)}
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
                onPress={() => setActivity(activity === a ? null : a)}
              />
            ))}
          </View>
        </View>
      </View>
    </EditScaffold>
  );
}

function Label({ text }: { text: string }) {
  return <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">{text}</Text>;
}
