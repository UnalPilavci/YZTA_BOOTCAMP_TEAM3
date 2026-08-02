import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Ban, Clock, LayoutGrid, Lock, UserCheck, UserPlus } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostTile } from '@/components/discover/post-tile';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Reveal } from '@/components/ui/reveal';
import { isBlocked, setBlock } from '@/services/supabase/blocks';
import { fetchDiscoverProfile, type DiscoverSnapshot } from '@/services/supabase/discover';
import {
  cancelFollowRequest,
  fetchFollowState,
  fetchUserPosts,
  requestFollow,
  setFollow,
  type FollowState,
  type PostView,
} from '@/services/supabase/posts';
import { useAuth } from '@/store/auth';
import { accentLime, onAccentLime, useResolvedScheme, useThemeColors } from '@/theme';

export default function DiscoverProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const isDark = useResolvedScheme() === 'dark';

  const { userId: paramUserId } = useLocalSearchParams<{ userId?: string }>();
  const myId = useAuth((s) => s.userId);
  const isSelf = !paramUserId || paramUserId === myId;
  const targetId = paramUserId;

  useEffect(() => {
    if (isSelf) router.replace('/profile');
  }, [isSelf, router]);

  const [remote, setRemote] = useState<DiscoverSnapshot | null>(null);
  const [posts, setPosts] = useState<PostView[]>([]);
  const [loading, setLoading] = useState(true);
  const [followState, setFollowState] = useState<FollowState>('none');
  const [followBusy, setFollowBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const didLoad = useRef(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const firstLoad = !didLoad.current;
      void (async () => {
        if (!targetId || !myId || isSelf) return;
        if (firstLoad) setLoading(true);
        try {
          const [p, snap, fState, isB] = await Promise.all([
            fetchUserPosts(targetId, myId),
            fetchDiscoverProfile(targetId),
            fetchFollowState(myId, targetId),
            isBlocked(myId, targetId),
          ]);
          if (!active) return;
          setPosts(p);
          setRemote(snap);
          setFollowState(fState);
          setBlocked(isB);
        } catch {
        } finally {
          didLoad.current = true;
          if (active && firstLoad) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [targetId, myId, isSelf]),
  );

  if (isSelf) return <View className="flex-1 bg-cream dark:bg-[#0C0F0C]" />;

  const name = remote?.displayName?.trim() || remote?.username || t('profile.guest');
  const username = remote?.username || 'nutrilens';
  const bio = remote?.bio ?? '';
  const avatarUrl = remote?.avatarUrl ?? '';
  const followerCount = remote?.followerCount ?? 0;
  const followingCount = remote?.followingCount ?? 0;
  const initial = (name.trim()[0] ?? 'U').toLocaleUpperCase('tr');
  const isPrivate = remote?.isPrivate ?? false;
  const isFollowing = followState === 'following';
  const locked = isPrivate && !isFollowing;

  const onToggleBlock = () => {
    if (!myId || !targetId) return;
    const next = !blocked;
    const run = async () => {
      setBlocked(next);
      if (next && isFollowing) {
        setFollowState('none');
        void setFollow(myId, targetId, false).catch(() => {});
      }
      try {
        await setBlock(myId, targetId, next);
      } catch {
        setBlocked(!next);
      }
    };
    if (next) {
      Alert.alert(
        t('discoverProfile.blockConfirmTitle', { name }),
        t('discoverProfile.blockConfirmMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('discoverProfile.block'), style: 'destructive', onPress: () => void run() },
        ],
      );
    } else {
      void run();
    }
  };

  const onToggleFollow = async () => {
    if (!myId || !targetId || followBusy) return;
    setFollowBusy(true);
    try {
      if (followState === 'following') {
        setFollowState('none');
        await setFollow(myId, targetId, false);
      } else if (followState === 'requested') {
        setFollowState('none');
        await cancelFollowRequest(myId, targetId);
      } else if (isPrivate) {
        setFollowState('requested');
        await requestFollow(myId, targetId);
      } else {
        setFollowState('following');
        await setFollow(myId, targetId, true);
      }
    } catch {
      try {
        setFollowState(await fetchFollowState(myId, targetId));
      } catch {
      }
    } finally {
      setFollowBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-1">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </PressableScale>
          <Text
            numberOfLines={1}
            className="flex-1 font-heading text-xl tracking-tight text-ink dark:text-ink-dark">
            @{username}
          </Text>
          <PressableScale
            haptic="medium"
            accessibilityLabel={t(blocked ? 'discoverProfile.unblock' : 'discoverProfile.block')}
            onPress={onToggleBlock}>
            <Ban size={22} color={blocked ? '#DB4C40' : colors.textMuted} />
          </PressableScale>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pt-3 pb-10 gap-4">
          <Reveal index={0}>
            <View className="flex-row items-center gap-5">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: 84, height: 84, borderRadius: 24 }}
                  contentFit="cover"
                />
              ) : (
                <View className="w-[84px] h-[84px] rounded-3xl items-center justify-center bg-[#101410] dark:bg-lime">
                  <Text
                    className="font-display text-4xl"
                    style={{ color: isDark ? onAccentLime : accentLime }}>
                    {initial}
                  </Text>
                </View>
              )}
              <View className="flex-1 flex-row justify-around">
                <Stat value={posts.length} label={t('discover.statPosts')} />
                <Stat
                  value={followerCount}
                  label={t('discover.statFollowers')}
                  onPress={
                    locked
                      ? undefined
                      : () =>
                          router.push({
                            pathname: '/user-list',
                            params: { mode: 'followers', userId: targetId },
                          })
                  }
                />
                <Stat
                  value={followingCount}
                  label={t('discover.statFollowing')}
                  onPress={
                    locked
                      ? undefined
                      : () =>
                          router.push({
                            pathname: '/user-list',
                            params: { mode: 'following', userId: targetId },
                          })
                  }
                />
              </View>
            </View>
          </Reveal>

          <Reveal index={1}>
            <View className="gap-1">
              <Text className="font-heading text-[17px] text-ink dark:text-ink-dark">{name}</Text>
              {!!bio.trim() && (
                <Text className="font-body text-[14px] leading-[20px] text-ink-muted dark:text-ink-dark-muted">
                  {bio.trim()}
                </Text>
              )}
            </View>
          </Reveal>

          {blocked ? (
            <Reveal index={2}>
              <View className="rounded-2xl p-4 gap-2 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                <View className="flex-row items-center gap-2">
                  <Ban size={16} color="#DB4C40" />
                  <Text className="font-heading text-[15px] text-ink dark:text-ink-dark">
                    {t('discoverProfile.blockedTitle')}
                  </Text>
                </View>
                <Text className="font-body text-[13px] leading-[19px] text-ink-muted dark:text-ink-dark-muted">
                  {t('discoverProfile.blockedBody')}
                </Text>
                <PressableScale
                  haptic="medium"
                  accessibilityLabel={t('discoverProfile.unblock')}
                  onPress={onToggleBlock}>
                  <View className="mt-1 h-10 rounded-xl items-center justify-center bg-cream dark:bg-surface-dark border border-border dark:border-border-dark">
                    <Text className="font-heading text-[14px] text-ink dark:text-ink-dark">
                      {t('discoverProfile.unblock')}
                    </Text>
                  </View>
                </PressableScale>
              </View>
            </Reveal>
          ) : (
            <>
              <Reveal index={2}>
                <FollowButton
                  state={followState}
                  isPrivate={isPrivate}
                  onPress={onToggleFollow}
                />
              </Reveal>

              {locked ? (
                <Reveal index={3}>
                  <View className="items-center gap-2 rounded-2xl p-8 mt-2 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                    <Lock size={28} color={colors.textMuted} />
                    <Text className="font-heading text-[15px] text-ink dark:text-ink-dark text-center">
                      {t('discover.privateTitle')}
                    </Text>
                    <Text className="font-body text-[13px] leading-[19px] text-ink-muted dark:text-ink-dark-muted text-center">
                      {t('discover.privateBody')}
                    </Text>
                  </View>
                </Reveal>
              ) : (
                <Reveal index={3}>
                <View className="gap-3">
                  <View className="flex-row items-center justify-center gap-2 pb-2.5 border-b-2 border-ink dark:border-ink-dark">
                    <LayoutGrid size={16} color={colors.text} />
                    <Text className="font-body-medium text-[13px] tracking-wider uppercase text-ink dark:text-ink-dark">
                      {t('discover.shareTab')}
                    </Text>
                  </View>

                  {loading ? (
                    <ActivityIndicator color={colors.textMuted} className="mt-6" />
                  ) : posts.length === 0 ? (
                    <Text className="text-center font-body-medium text-sm text-ink-muted dark:text-ink-dark-muted mt-8">
                      {t('discover.emptyPostsOther')}
                    </Text>
                  ) : (
                    <View className="flex-row flex-wrap justify-between gap-y-3">
                      {posts.map((post) => (
                        <View key={post.id} className="w-[48.5%]">
                          <PostTile
                            post={post}
                            onPress={() =>
                              router.push({
                                pathname: '/my-posts-feed',
                                params: { postId: post.id, userId: targetId },
                              })
                            }
                          />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                </Reveal>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FollowButton({
  state,
  isPrivate,
  onPress,
}: {
  state: FollowState;
  isPrivate: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  const following = state === 'following';
  const requested = state === 'requested';
  const filled = state === 'none';
  const label = following
    ? t('discover.following')
    : requested
      ? t('discover.requested')
      : isPrivate
        ? t('discover.requestFollow')
        : t('discover.follow');
  const Icon = following ? UserCheck : requested ? Clock : UserPlus;

  return (
    <PressableScale haptic="medium" accessibilityLabel={label} onPress={onPress}>
      <View
        className={`flex-row items-center justify-center gap-2 h-11 rounded-xl ${
          filled ? '' : 'bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark'
        }`}
        style={filled ? { backgroundColor: accentLime } : undefined}>
        <Icon size={16} color={filled ? onAccentLime : colors.text} />
        <Text
          className="font-heading text-[14px]"
          style={{ color: filled ? onAccentLime : colors.text }}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

function Stat({
  value,
  label,
  onPress,
}: {
  value: number;
  label: string;
  onPress?: () => void;
}) {
  const body = (
    <View className="items-center">
      <Text className="font-display text-lg text-ink dark:text-ink-dark tabular-nums">{value}</Text>
      <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted mt-0.5">
        {label}
      </Text>
    </View>
  );
  if (!onPress) return body;
  return (
    <PressableScale haptic="light" accessibilityLabel={label} onPress={onPress}>
      {body}
    </PressableScale>
  );
}
