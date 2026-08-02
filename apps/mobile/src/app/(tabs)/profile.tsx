import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { LayoutGrid, Pencil, Settings as SettingsIcon } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostTile } from '@/components/discover/post-tile';
import { PressableScale } from '@/components/ui/pressable-scale';
import { deletePost, fetchUserPosts, type PostView } from '@/services/supabase/posts';
import { useAuth } from '@/store/auth';
import { resolveDisplayName, resolveUsername, useDiscoverProfile } from '@/store/discover';
import { useProfile } from '@/store/profile';
import { useScans } from '@/store/scans';
import { accentLime, onAccentLime, useResolvedScheme, useThemeColors } from '@/theme';

const DAY = 86_400_000;
const startOfDay = (ms: number) => new Date(ms).setHours(0, 0, 0, 0);

function computeStreak(times: number[]): number {
  if (times.length === 0) return 0;
  const days = new Set(times.map(startOfDay));
  let streak = 0;
  let cursor = startOfDay(Date.now());
  while (days.has(cursor)) {
    streak++;
    cursor -= DAY;
  }
  return streak;
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const isDark = useResolvedScheme() === 'dark';

  const name = useProfile((s) => s.name);
  const email = useProfile((s) => s.email);
  const scans = useScans((s) => s.scans);

  const storeName = useDiscoverProfile((s) => s.displayName);
  const storeUsername = useDiscoverProfile((s) => s.username);
  const storeBio = useDiscoverProfile((s) => s.bio);
  const storeAvatar = useDiscoverProfile((s) => s.avatarUrl);
  const followerCount = useDiscoverProfile((s) => s.followerCount);
  const followingCount = useDiscoverProfile((s) => s.followingCount);

  const displayName = resolveDisplayName(storeName, name, t('profile.guest'));
  const username = resolveUsername(storeUsername, displayName);
  const initial = (displayName.trim()[0] ?? 'U').toLocaleUpperCase('tr');

  const [posts, setPosts] = useState<PostView[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const didLoad = useRef(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const firstLoad = !didLoad.current;
      void (async () => {
        const myId = useAuth.getState().userId;
        if (!myId) return;
        if (firstLoad) setPostsLoading(true);
        try {
          const p = await fetchUserPosts(myId, myId);
          if (active) setPosts(p);
        } catch {
        } finally {
          didLoad.current = true;
          if (active && firstLoad) setPostsLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const onDeletePost = (id: string) =>
    Alert.alert(t('discover.postDeleteTitle'), t('discover.postDeleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('history.delete'),
        style: 'destructive',
        onPress: async () => {
          const backup = posts;
          setPosts((prev) => prev.filter((p) => p.id !== id));
          try {
            await deletePost(id);
          } catch {
            setPosts(backup);
          }
        },
      },
    ]);

  const scanCount = scans.length;
  const consumedScans = scans.filter((s) => s.consumed);
  const avg = consumedScans.length
    ? Math.round(consumedScans.reduce((sum, r) => sum + r.healthScore, 0) / consumedScans.length)
    : 0;
  const streak = computeStreak(scans.map((s) => s.createdAt));

  return (
    <View className="flex-1 bg-cream dark:bg-surface-dark">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pb-28 gap-5">
          <View className="flex-row items-center justify-between pt-2">
            <Text className="font-heading text-2xl tracking-tight text-ink dark:text-ink-dark">
              {t('profile.title')}
            </Text>
            <PressableScale
              haptic="light"
              accessibilityLabel={t('settings.title')}
              onPress={() => router.push('/settings')}
              style={{ width: 44, height: 44 }}>
              <View className="w-11 h-11 rounded-full items-center justify-center bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                <SettingsIcon size={20} color={colors.text} />
              </View>
            </PressableScale>
          </View>

          <View className="items-center gap-3">
            <PressableScale
              haptic="light"
              accessibilityLabel={t('discover.editProfile')}
              onPress={() => router.push('/discover-edit')}>
              <View>
                {storeAvatar ? (
                  <Image
                    source={{ uri: storeAvatar }}
                    style={{ width: 88, height: 88, borderRadius: 24 }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-[88px] h-[88px] rounded-3xl items-center justify-center bg-[#101410] dark:bg-lime">
                    <Text
                      className="font-display text-4xl"
                      style={{ color: isDark ? onAccentLime : accentLime }}>
                      {initial}
                    </Text>
                  </View>
                )}
                <View className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full items-center justify-center bg-lime border-2 border-cream dark:border-surface-dark">
                  <Pencil size={13} color={onAccentLime} />
                </View>
              </View>
            </PressableScale>
            <View className="items-center">
              <Text className="font-heading text-xl text-ink dark:text-ink-dark">
                {displayName}
              </Text>
              <Text className="font-body text-sm text-ink-muted dark:text-ink-dark-muted mt-0.5">
                @{username}
              </Text>
              {!!email && (
                <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted mt-0.5">
                  {email}
                </Text>
              )}
              <Text className="font-body text-[14px] leading-[20px] text-center text-ink-muted dark:text-ink-dark-muted mt-2 px-4">
                {storeBio.trim() || t('discover.defaultBio')}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center rounded-2xl py-3.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
            <SocialStat value={posts.length} label={t('discover.statPosts')} />
            <View className="w-px h-8 bg-border dark:bg-border-dark" />
            <SocialStat
              value={followerCount}
              label={t('discover.statFollowers')}
              onPress={() => router.push({ pathname: '/user-list', params: { mode: 'followers' } })}
            />
            <View className="w-px h-8 bg-border dark:bg-border-dark" />
            <SocialStat
              value={followingCount}
              label={t('discover.statFollowing')}
              onPress={() => router.push({ pathname: '/user-list', params: { mode: 'following' } })}
            />
          </View>

          <View className="flex-row gap-3">
            <StatCard value={scanCount} label={t('profile.scans')} />
            <StatCard
              value={avg}
              label={t('profile.avgScore')}
              highlight
              onPress={() => router.push('/health-report')}
            />
            <StatCard value={streak} label={t('profile.dayStreak')} />
          </View>

          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <LayoutGrid size={16} color={colors.text} />
              <Text className="font-body-medium text-[13px] tracking-wider uppercase text-ink dark:text-ink-dark">
                {t('profile.myPosts')}
              </Text>
            </View>
            {postsLoading ? (
              <ActivityIndicator color={colors.textMuted} className="mt-4" />
            ) : posts.length === 0 ? (
              <Text className="text-center font-body-medium text-sm text-ink-muted dark:text-ink-dark-muted mt-4">
                {t('discover.emptyPosts')}
              </Text>
            ) : (
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {posts.map((post) => (
                  <View key={post.id} className="w-[48.5%]">
                    <PostTile
                      post={post}
                      onPress={() =>
                        router.push({ pathname: '/my-posts-feed', params: { postId: post.id } })
                      }
                      onLongPress={() => onDeletePost(post.id)}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SocialStat({
  value,
  label,
  onPress,
}: {
  value: number;
  label: string;
  onPress?: () => void;
}) {
  const inner = (
    <View className="items-center">
      <Text className="font-display text-xl text-ink dark:text-ink-dark tabular-nums">{value}</Text>
      <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted mt-0.5">
        {label}
      </Text>
    </View>
  );
  return (
    <View style={{ flex: 1 }}>
      {onPress ? (
        <PressableScale haptic="light" accessibilityLabel={label} onPress={onPress}>
          {inner}
        </PressableScale>
      ) : (
        inner
      )}
    </View>
  );
}

function StatCard({
  value,
  label,
  highlight,
  onPress,
}: {
  value: number;
  label: string;
  highlight?: boolean;
  onPress?: () => void;
}) {
  const card = (
    <View
      className={`w-full items-center rounded-2xl py-4 px-2 ${
        highlight
          ? 'bg-[#101410]'
          : 'bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark'
      }`}>
      <Text
        className={`font-display text-2xl ${
          highlight ? 'text-lime' : 'text-ink dark:text-ink-dark'
        }`}>
        {value}
      </Text>
      <Text
        numberOfLines={1}
        className={`font-body text-[11px] mt-1 ${
          highlight ? 'text-white/70' : 'text-ink-muted dark:text-ink-dark-muted'
        }`}>
        {label}
      </Text>
    </View>
  );
  return (
    <View style={{ flex: 1 }}>
      {onPress ? (
        <PressableScale haptic="light" accessibilityLabel={label} onPress={onPress}>
          {card}
        </PressableScale>
      ) : (
        card
      )}
    </View>
  );
}
