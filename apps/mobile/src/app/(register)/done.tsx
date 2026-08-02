import { useRouter } from 'expo-router';
import { AlertTriangle, Check, ScanLine } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';

import { RegisterScaffold } from '@/components/register/register-scaffold';
import { uploadAvatar } from '@/services/supabase/storage';
import { useAuth } from '@/store/auth';
import { useDiscoverProfile } from '@/store/discover';
import { useProfile } from '@/store/profile';
import { onAccentLime } from '@/theme';

export default function DoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const conditions = useProfile((s) => s.conditions);
  const allergens = useProfile((s) => s.allergens);
  const complete = useProfile((s) => s.complete);
  const [busy, setBusy] = useState(false);

  const conditionText =
    conditions.length > 0
      ? conditions.map((id) => t(`options.conditions.${id}`)).join(', ')
      : t('register.done.none');
  const allergenText =
    allergens.length > 0
      ? t('register.done.selectedCount', { count: allergens.length })
      : t('register.done.none');

  const onStart = async () => {
    if (busy) return;
    const userId = useAuth.getState().userId;
    if (!userId) return;

    setBusy(true);
    complete();
    try {
      await useProfile.getState().saveToServer(userId);

      const pendingAvatar = useDiscoverProfile.getState().pendingAvatarUri;
      if (pendingAvatar) {
        try {
          const avatarUrl = await uploadAvatar(userId, pendingAvatar);
          await useDiscoverProfile.getState().setProfile({
            displayName: useDiscoverProfile.getState().displayName,
            username: useDiscoverProfile.getState().username,
            bio: useDiscoverProfile.getState().bio,
            avatarUrl,
          });
          useDiscoverProfile.getState().setPendingAvatar(null);
        } catch {
        }
      }
    } catch {
      useProfile.setState({ completed: false });
      setBusy(false);
      Alert.alert(t('register.done.saveFailedTitle'), t('register.done.saveFailedMessage'));
    }
  };

  return (
    <RegisterScaffold
      kicker={t('register.kickerDone')}
      step={7}
      totalSteps={7}
      onBack={() => router.back()}
      primaryLabel={t('register.done.start')}
      onPrimary={onStart}
      PrimaryIcon={ScanLine}>
      <View className="items-center pt-6">
        <MotiView
          from={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-20 h-20 rounded-full items-center justify-center bg-lime">
          <Check size={40} color={onAccentLime} strokeWidth={3} />
        </MotiView>

        <Text className="font-display text-[26px] leading-8 text-ink dark:text-ink-dark text-center mt-6">
          {t('register.done.title')}
        </Text>
        <Text className="font-body text-sm text-ink-muted dark:text-ink-dark-muted text-center mt-2 px-4">
          {t('register.done.subtitle')}
        </Text>
      </View>

      <View className="rounded-2xl p-5 mt-8 bg-[#101410] dark:bg-surface-raised-dark dark:border dark:border-border-dark">
        <Text className="font-body-medium text-[11px] tracking-[2px] text-white/60 dark:text-ink-dark-muted">
          {t('register.done.yourProfile')}
        </Text>
        <SummaryRow label={t('register.done.conditionsLabel')} value={conditionText} />
        <SummaryRow label={t('register.done.allergensLabel')} value={allergenText} />
      </View>

      <View className="flex-row items-start gap-2.5 rounded-2xl p-4 mt-4 bg-[#FDF3E1] dark:bg-[#2E2410]">
        <AlertTriangle size={18} color="#F2A73B" />
        <Text className="flex-1 font-body text-[12px] leading-[17px] text-ink-muted dark:text-ink-dark-muted">
          {t('register.done.disclaimer')}
        </Text>
      </View>
    </RegisterScaffold>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4 mt-3">
      <Text className="font-body text-[13px] text-white/70 dark:text-ink-dark-muted">
        {label}
      </Text>
      <Text
        numberOfLines={1}
        className="flex-1 text-right font-body-bold text-[13px] text-lime">
        {value}
      </Text>
    </View>
  );
}
