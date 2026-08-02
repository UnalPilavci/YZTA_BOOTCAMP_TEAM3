import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Lock, UserPlus } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Toggle } from '@/components/ui/toggle';
import { countIncomingRequests } from '@/services/supabase/posts';
import { useAuth } from '@/store/auth';
import { useDiscoverProfile } from '@/store/discover';
import { useThemeColors } from '@/theme';

export default function PrivacySettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();

  const isPrivate = useDiscoverProfile((s) => s.isPrivate);
  const setPrivacy = useDiscoverProfile((s) => s.setPrivacy);
  const [reqCount, setReqCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const myId = useAuth.getState().userId;
      if (!myId) return;
      void countIncomingRequests(myId)
        .then((n) => active && setReqCount(n))
        .catch(() => {});
      return () => {
        active = false;
      };
    }, []),
  );

  const onTogglePrivacy = (next: boolean) => {
    void setPrivacy(next).catch(() => {
      Alert.alert(t('common.error'), t('discover.privacySaveFailed'));
    });
  };

  return (
    <View className="flex-1 bg-cream dark:bg-surface-dark">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-1">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </PressableScale>
          <Text className="font-heading text-2xl tracking-tight text-ink dark:text-ink-dark">
            {t('settings.privacyRow')}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-4 pt-4 pb-8 gap-4">
          <View className="rounded-2xl bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
            <View className="flex-row items-center gap-3 px-4 py-3.5">
              <Lock size={18} color={colors.textMuted} />
              <View className="flex-1">
                <Text className="font-heading text-[14px] text-ink dark:text-ink-dark">
                  {t('discover.privateAccount')}
                </Text>
                <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted">
                  {t('discover.privateAccountHint')}
                </Text>
              </View>
              <Toggle value={isPrivate} onChange={onTogglePrivacy} />
            </View>
            {isPrivate && (
              <PressableScale
                haptic="light"
                accessibilityLabel={t('discover.followRequests')}
                onPress={() => router.push('/follow-requests')}>
                <View className="flex-row items-center gap-3 px-4 py-3.5 border-t border-border dark:border-border-dark">
                  <UserPlus size={18} color={colors.textMuted} />
                  <Text className="flex-1 font-heading text-[14px] text-ink dark:text-ink-dark">
                    {t('discover.followRequests')}
                  </Text>
                  {reqCount > 0 && (
                    <View className="min-w-[22px] h-[22px] px-1.5 rounded-full items-center justify-center bg-lime">
                      <Text className="font-body-bold text-[12px] tabular-nums text-lime-on">
                        {reqCount}
                      </Text>
                    </View>
                  )}
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>
              </PressableScale>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
