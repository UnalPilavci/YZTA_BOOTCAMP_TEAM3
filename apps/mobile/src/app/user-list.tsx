import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Search, Users, X } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { PressableScale } from '@/components/ui/pressable-scale';
import { fetchBlockedUsers, setBlock } from '@/services/supabase/blocks';
import { fetchFollowList, type UserListItem } from '@/services/supabase/posts';
import { useAuth } from '@/store/auth';
import { useThemeColors } from '@/theme';

type Mode = 'followers' | 'following' | 'blocked';

export default function UserListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const { mode: modeParam, userId: paramUserId } = useLocalSearchParams<{
    mode?: string;
    userId?: string;
  }>();
  const mode: Mode =
    modeParam === 'following' ? 'following' : modeParam === 'blocked' ? 'blocked' : 'followers';

  const myId = useAuth((s) => s.userId);
  const targetId = paramUserId || myId;

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    if (!targetId || !myId) return;
    if (mode === 'blocked') {
      setUsers(await fetchBlockedUsers(myId));
    } else {
      setUsers(await fetchFollowList(targetId, mode));
    }
  }, [targetId, myId, mode]);

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

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLocaleLowerCase('tr').includes(q) ||
        u.username.toLocaleLowerCase('tr').includes(q),
    );
  }, [users, query]);

  const onUnblock = async (userId: string) => {
    if (!myId) return;
    setUsers((prev) => prev.filter((u) => u.userId !== userId));
    try {
      await setBlock(myId, userId, false);
    } catch {
      void load();
    }
  };

  const title = t(
    mode === 'following'
      ? 'discoverSettings.following'
      : mode === 'blocked'
        ? 'discoverSettings.blocked'
        : 'discoverSettings.followers',
  );
  const emptyText = t(
    mode === 'following'
      ? 'userList.emptyFollowing'
      : mode === 'blocked'
        ? 'userList.emptyBlocked'
        : 'userList.emptyFollowers',
  );

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
            {title}
          </Text>
        </View>

        {!loading && users.length > 0 && (
          <View className="px-4 pt-2 pb-1">
            <View className="flex-row items-center gap-2.5 h-11 rounded-xl px-3.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
              <Search size={18} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('userList.searchPlaceholder')}
                placeholderTextColor={colors.textMuted}
                className="flex-1 font-body text-[15px] text-ink dark:text-ink-dark"
                autoCapitalize="none"
                returnKeyType="search"
              />
              {query.length > 0 && (
                <PressableScale
                  haptic="light"
                  accessibilityLabel={t('common.close')}
                  onPress={() => setQuery('')}>
                  <X size={16} color={colors.textMuted} />
                </PressableScale>
              )}
            </View>
          </View>
        )}

        {loading ? (
          <View className="flex-1 items-center justify-center pb-20">
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : users.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10 gap-3 pb-20">
            <Users size={40} color={colors.textMuted} />
            <Text className="text-center font-body-medium text-[14px] text-ink-muted dark:text-ink-dark-muted">
              {emptyText}
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10 gap-3 pb-20">
            <Search size={36} color={colors.textMuted} />
            <Text className="text-center font-body-medium text-[14px] text-ink-muted dark:text-ink-dark-muted">
              {t('userList.searchEmpty')}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="px-4 pt-2 pb-10 gap-3">
            {filtered.map((user) => {
              const label = user.name || user.username || '?';
              const initial = label.trim()[0]?.toLocaleUpperCase('tr') ?? '?';
              return (
                <View
                  key={user.userId}
                  className="flex-row items-center gap-3 rounded-2xl p-3.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                  <PressableScale
                    haptic="light"
                    accessibilityLabel={label}
                    onPress={() =>
                      router.push({ pathname: '/discover-profile', params: { userId: user.userId } })
                    }
                    style={{ flex: 1 }}>
                    <View className="flex-row items-center gap-3">
                      <Avatar initial={initial} uri={user.avatarUrl} size={48} />
                      <View className="flex-1">
                        <Text
                          numberOfLines={1}
                          className="font-heading text-[15px] text-ink dark:text-ink-dark">
                          {label}
                        </Text>
                        {!!user.username && (
                          <Text
                            numberOfLines={1}
                            className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted mt-0.5">
                            @{user.username}
                          </Text>
                        )}
                      </View>
                    </View>
                  </PressableScale>

                  {mode === 'blocked' ? (
                    <PressableScale
                      haptic="medium"
                      accessibilityLabel={t('userList.unblock')}
                      onPress={() => onUnblock(user.userId)}>
                      <View className="rounded-pill px-3.5 h-9 items-center justify-center bg-cream dark:bg-surface-dark border border-border dark:border-border-dark">
                        <Text className="font-heading text-[13px] text-ink dark:text-ink-dark">
                          {t('userList.unblock')}
                        </Text>
                      </View>
                    </PressableScale>
                  ) : (
                    <ChevronRight size={18} color={colors.textMuted} />
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
