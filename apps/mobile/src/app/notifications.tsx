import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import type { TFunction } from 'i18next';
import { ArrowLeft, Bell, ChevronRight, Heart, MessageCircle, UserPlus } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { PressableScale } from '@/components/ui/pressable-scale';
import { formatTimeAgo } from '@/data/discover';
import { useRealtimeInsert } from '@/hooks/use-realtime';
import {
  fetchNotifications,
  markNotificationsRead,
  type NotifActor,
  type NotificationGroup,
} from '@/services/supabase/notifications';
import {
  fetchMyFollowingIds,
  fetchMyRequestedIds,
  followOrRequest,
  type FollowState,
} from '@/services/supabase/posts';
import { useAuth } from '@/store/auth';
import { accentLime, onAccentLime, useThemeColors } from '@/theme';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const myId = useAuth((s) => s.userId);

  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [followBack, setFollowBack] = useState<Record<string, FollowState>>({});

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const didLoad = useRef(false);
  const load = useCallback(
    async (firstLoad: boolean) => {
      if (!myId) return;
      if (firstLoad) setLoading(true);
      try {
        const [gs, followingIds, requestedIds] = await Promise.all([
          fetchNotifications(myId),
          fetchMyFollowingIds(myId),
          fetchMyRequestedIds(myId),
        ]);
        if (!mounted.current) return;
        setGroups(gs);
        const state: Record<string, FollowState> = {};
        for (const g of gs) {
          if (g.type !== 'follow') continue;
          for (const a of g.actors) {
            state[a.id] = followingIds.has(a.id)
              ? 'following'
              : requestedIds.has(a.id)
                ? 'requested'
                : 'none';
          }
        }
        setFollowBack(state);
        void markNotificationsRead(myId).catch(() => {});
      } catch {
      } finally {
        didLoad.current = true;
        if (mounted.current && firstLoad) setLoading(false);
      }
    },
    [myId],
  );

  useFocusEffect(
    useCallback(() => {
      void load(!didLoad.current);
    }, [load]),
  );

  useRealtimeInsert<{ user_id: string }>({
    channelName: 'notif-screen',
    table: 'notifications',
    filter: myId ? `user_id=eq.${myId}` : undefined,
    enabled: !!myId,
    onInsert: () => void load(false),
  });

  const onFollowBack = async (actorId: string) => {
    if (!myId) return;
    const prev = followBack[actorId] ?? 'none';
    setFollowBack((s) => ({ ...s, [actorId]: 'following' }));
    try {
      const next = await followOrRequest(myId, actorId);
      setFollowBack((s) => ({ ...s, [actorId]: next }));
    } catch {
      setFollowBack((s) => ({ ...s, [actorId]: prev }));
    }
  };

  const openPost = (postId: string | null, comments: boolean) => {
    if (!postId) return;
    if (comments) router.push({ pathname: '/post-comments', params: { postId } });
    else router.push({ pathname: '/my-posts-feed', params: { postId } });
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
            {t('notifications.title')}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center pb-20">
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : groups.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10 gap-3 pb-20">
            <Bell size={40} color={colors.textMuted} />
            <Text className="text-center font-body-medium text-[14px] text-ink-muted dark:text-ink-dark-muted">
              {t('notifications.empty')}
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pt-1 pb-10">
            {groups.map((g) => (
              <NotificationRow
                key={g.key}
                group={g}
                followBackState={g.type === 'follow' ? followBack[g.actors[0].id] : undefined}
                onOpenProfile={(id) =>
                  router.push({ pathname: '/discover-profile', params: { userId: id } })
                }
                onOpenPost={openPost}
                onOpenRequests={() => router.push('/follow-requests')}
                onFollowBack={() => onFollowBack(g.actors[0].id)}
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function formatNames(actors: NotifActor[], total: number, t: TFunction): string {
  const nameOf = (a: NotifActor) => a.name || a.username || t('profile.guest');
  if (total <= 1) return nameOf(actors[0]);
  if (total === 2) return t('notifications.twoNames', { a: nameOf(actors[0]), b: nameOf(actors[1]) });
  return t('notifications.manyNames', {
    a: nameOf(actors[0]),
    b: nameOf(actors[1]),
    count: total - 2,
  });
}

const ACTION_TEXT: Record<NotificationGroup['type'], string> = {
  like: 'notifications.likedYourPost',
  comment: 'notifications.commentedYourPost',
  follow: 'notifications.startedFollowing',
  follow_accept: 'notifications.acceptedRequest',
  follow_request: 'notifications.wantsToFollow',
};

function NotificationRow({
  group,
  followBackState,
  onOpenProfile,
  onOpenPost,
  onOpenRequests,
  onFollowBack,
}: {
  group: NotificationGroup;
  followBackState?: FollowState;
  onOpenProfile: (id: string) => void;
  onOpenPost: (postId: string | null, comments: boolean) => void;
  onOpenRequests: () => void;
  onFollowBack: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const lead = group.actors[0];
  const names = formatNames(group.actors, group.totalActors, t);
  const initial = (lead.name.trim()[0] ?? lead.username[0] ?? '?').toLocaleUpperCase('tr');

  const onPress = () => {
    switch (group.type) {
      case 'like':
        return onOpenPost(group.postId, false);
      case 'comment':
        return onOpenPost(group.postId, true);
      case 'follow_request':
        return onOpenRequests();
      default:
        return onOpenProfile(lead.id);
    }
  };

  const TypeIcon = group.type === 'like' ? Heart : group.type === 'comment' ? MessageCircle : UserPlus;
  const badgeColor =
    group.type === 'like' ? '#F43F5E' : group.type === 'comment' ? '#3B82F6' : accentLime;

  return (
    <PressableScale haptic="light" accessibilityLabel={names} onPress={onPress}>
      <View
        className={`flex-row items-center gap-3 px-4 py-3 ${
          group.unread ? 'bg-lime/10 dark:bg-lime/[0.06]' : ''
        }`}>
        <View>
          <Avatar initial={initial} uri={lead.avatarUrl} size={44} />
          <View
            className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full items-center justify-center border-2 border-cream dark:border-surface-dark"
            style={{ backgroundColor: badgeColor }}>
            <TypeIcon size={9} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        </View>

        <View className="flex-1">
          <Text className="font-body text-[14px] leading-[19px] text-ink dark:text-ink-dark">
            <Text className="font-heading">{names}</Text>{' '}
            <Text className="text-ink-muted dark:text-ink-dark-muted">{t(ACTION_TEXT[group.type])}</Text>
          </Text>
          <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted mt-0.5">
            {formatTimeAgo(group.createdAt, t)}
          </Text>
        </View>

        {group.type === 'like' || group.type === 'comment' ? (
          <PostThumb uri={group.postImageUrl} />
        ) : group.type === 'follow_request' ? (
          <ChevronRight size={20} color={colors.textMuted} />
        ) : group.type === 'follow' && group.totalActors === 1 ? (
          <FollowBackButton state={followBackState ?? 'none'} onPress={onFollowBack} />
        ) : null}
      </View>
    </PressableScale>
  );
}

function PostThumb({ uri }: { uri: string | null }) {
  if (!uri) {
    return <View className="w-11 h-11 rounded-lg bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark" />;
  }
  return <Image source={{ uri }} style={{ width: 44, height: 44, borderRadius: 8 }} contentFit="cover" />;
}

function FollowBackButton({ state, onPress }: { state: FollowState; onPress: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const done = state !== 'none';
  const label =
    state === 'following'
      ? t('discover.following')
      : state === 'requested'
        ? t('discover.requested')
        : t('notifications.followBack');
  return (
    <PressableScale
      haptic="light"
      accessibilityLabel={label}
      onPress={done ? undefined : onPress}>
      <View
        className={`h-9 px-3.5 rounded-lg items-center justify-center ${
          done ? 'bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark' : ''
        }`}
        style={done ? undefined : { backgroundColor: accentLime }}>
        <Text
          className="font-heading text-[13px]"
          style={{ color: done ? colors.text : onAccentLime }}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}
