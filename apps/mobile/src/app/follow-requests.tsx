import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, Check, UserPlus, X } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UserRow } from '@/components/discover/user-row';
import { PressableScale } from '@/components/ui/pressable-scale';
import {
  approveFollowRequest,
  fetchIncomingRequests,
  rejectFollowRequest,
  type IncomingRequest,
} from '@/services/supabase/posts';
import { useAuth } from '@/store/auth';
import { accentLime, onAccentLime, useThemeColors } from '@/theme';

export default function FollowRequestsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const myId = useAuth((s) => s.userId);

  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!myId) return;
    setRequests(await fetchIncomingRequests(myId));
  }, [myId]);

  const didLoad = useRef(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const firstLoad = !didLoad.current;
      if (firstLoad) setLoading(true);
      void load().finally(() => {
        didLoad.current = true;
        if (active && firstLoad) setLoading(false);
      });
      return () => {
        active = false;
      };
    }, [load]),
  );

  const onApprove = async (userId: string) => {
    if (busyId) return;
    setBusyId(userId);
    setRequests((prev) => prev.filter((r) => r.userId !== userId));
    try {
      await approveFollowRequest(userId);
    } catch {
      void load();
    } finally {
      setBusyId(null);
    }
  };

  const onReject = async (userId: string) => {
    if (busyId || !myId) return;
    setBusyId(userId);
    setRequests((prev) => prev.filter((r) => r.userId !== userId));
    try {
      await rejectFollowRequest(myId, userId);
    } catch {
      void load();
    } finally {
      setBusyId(null);
    }
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
            {t('discover.followRequests')}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center pb-20">
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : requests.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10 gap-3 pb-20">
            <UserPlus size={40} color={colors.textMuted} />
            <Text className="text-center font-body-medium text-[14px] text-ink-muted dark:text-ink-dark-muted">
              {t('discover.followRequestsEmpty')}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-4 pt-1 pb-10">
            {requests.map((user) => (
              <UserRow
                key={user.userId}
                user={user}
                onPress={() =>
                  router.push({ pathname: '/discover-profile', params: { userId: user.userId } })
                }
                action={
                  <View className="flex-row items-center gap-2">
                    <PressableScale
                      haptic="light"
                      accessibilityLabel={t('discover.approve')}
                      onPress={() => onApprove(user.userId)}>
                      <View
                        className="w-9 h-9 rounded-full items-center justify-center"
                        style={{ backgroundColor: accentLime }}>
                        <Check size={17} color={onAccentLime} />
                      </View>
                    </PressableScale>
                    <PressableScale
                      haptic="medium"
                      accessibilityLabel={t('discover.reject')}
                      onPress={() => onReject(user.userId)}>
                      <View className="w-9 h-9 rounded-full items-center justify-center bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                        <X size={17} color={colors.textMuted} />
                      </View>
                    </PressableScale>
                  </View>
                }
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
