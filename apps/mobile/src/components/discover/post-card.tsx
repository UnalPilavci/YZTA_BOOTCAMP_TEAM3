import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { PressableScale } from '@/components/ui/pressable-scale';
import { formatTimeAgo, postIcon } from '@/data/discover';
import { useReport } from '@/hooks/use-report';
import { setBookmark, setLike, type PostView } from '@/services/supabase/posts';
import { useAuth } from '@/store/auth';
import { accentLime, getScore, readableText, useThemeColors } from '@/theme';

export function PostCard({
  post,
  patch,
  onEdit,
  onDelete,
}: {
  post: PostView;
  patch: (id: string, next: Partial<PostView>) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const promptReport = useReport();
  const showOwnerMenu = post.isMine && (!!onEdit || !!onDelete);
  const showReport = !post.isMine;

  const openOwnerMenu = () => {
    const buttons: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [];
    if (onEdit) buttons.push({ text: t('discover.editPostAction'), onPress: onEdit });
    if (onDelete)
      buttons.push({ text: t('history.delete'), style: 'destructive', onPress: onDelete });
    buttons.push({ text: t('common.cancel'), style: 'cancel' });
    Alert.alert(t('discover.postOptionsTitle'), undefined, buttons);
  };
  const { grade, color } = getScore(post.healthScore);
  const Icon = postIcon(post.iconKey);
  const authorName = post.authorName || t('common.unknownProduct');
  const initial = (post.authorName.trim()[0] ?? '?').toLocaleUpperCase('tr');

  const openAuthor = () => {
    if (post.isMine) router.push('/profile');
    else router.push({ pathname: '/discover-profile', params: { userId: post.userId } });
  };

  const onLike = () => {
    const liked = !post.likedByMe;
    patch(post.id, { likedByMe: liked, likeCount: post.likeCount + (liked ? 1 : -1) });
    const myId = useAuth.getState().userId;
    if (myId)
      void setLike(post.id, myId, liked).catch(() =>
        patch(post.id, { likedByMe: !liked, likeCount: post.likeCount }),
      );
  };

  const onBookmark = () => {
    const saved = !post.bookmarkedByMe;
    patch(post.id, { bookmarkedByMe: saved });
    const myId = useAuth.getState().userId;
    if (myId)
      void setBookmark(post.id, myId, saved).catch(() =>
        patch(post.id, { bookmarkedByMe: !saved }),
      );
  };

  return (
    <Card className="p-4 gap-3" elevation="none">
      <View className="flex-row items-center gap-3">
        <PressableScale haptic="light" onPress={openAuthor}>
          <View className="flex-row items-center gap-3">
            <Avatar initial={initial} uri={post.authorAvatarUrl} />
            <View>
              <Text className="font-heading text-[15px] text-ink dark:text-ink-dark">
                {authorName}
              </Text>
              <Text className="font-body text-xs text-ink-muted dark:text-ink-dark-muted">
                {formatTimeAgo(post.createdAt, t)}
              </Text>
            </View>
          </View>
        </PressableScale>
        {(showOwnerMenu || showReport) && (
          <>
            <View className="flex-1" />
            <PressableScale
              haptic="light"
              accessibilityLabel={showOwnerMenu ? t('discover.postOptionsTitle') : t('report.title')}
              onPress={showOwnerMenu ? openOwnerMenu : () => promptReport('post', post.id)}>
              <View className="w-8 h-8 items-center justify-center">
                <MoreHorizontal size={20} color={colors.textMuted} />
              </View>
            </PressableScale>
          </>
        )}
      </View>

      <View className="flex-row items-center gap-3 p-3 rounded-2xl bg-[#101410] dark:bg-surface-raised-dark">
        <View className="w-9 h-9 rounded-lg items-center justify-center bg-white/10">
          <Icon size={20} color={accentLime} />
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="font-heading text-[14px] text-white">
            {post.productName}
          </Text>
          {post.kcal != null && (
            <Text className="font-body text-xs text-white/60">
              {t('discover.kcal', { count: post.kcal })}
            </Text>
          )}
        </View>
        <View className="rounded-pill px-2.5 py-1" style={{ backgroundColor: color }}>
          <Text
            className="font-body-bold text-[13px] tabular-nums"
            style={{ color: readableText(color) }}>
            {grade}·{post.healthScore}
          </Text>
        </View>
      </View>

      {!!post.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          style={{ width: '100%', height: 200, borderRadius: 16 }}
          contentFit="cover"
          transition={200}
        />
      )}

      {!!post.body && (
        <Text className="font-body text-[14px] leading-[20px] text-ink dark:text-ink-dark">
          {post.body}
        </Text>
      )}

      <View className="flex-row items-center gap-5 pt-0.5">
        <PostAction
          Icon={Heart}
          label={String(post.likeCount)}
          active={post.likedByMe}
          activeColor="#E24C4C"
          onPress={onLike}
        />
        <PostAction
          Icon={MessageCircle}
          label={String(post.commentCount)}
          onPress={() => router.push({ pathname: '/post-comments', params: { postId: post.id } })}
        />
        <View className="flex-1" />
        <PressableScale haptic="light" onPress={onBookmark} accessibilityLabel={t('discover.save')}>
          <Bookmark
            size={18}
            color={post.bookmarkedByMe ? accentLime : colors.textMuted}
            fill={post.bookmarkedByMe ? accentLime : 'transparent'}
          />
        </PressableScale>
      </View>
    </Card>
  );
}

function PostAction({
  Icon,
  label,
  active,
  activeColor,
  onPress,
}: {
  Icon: LucideIcon;
  label: string;
  active?: boolean;
  activeColor?: string;
  onPress?: () => void;
}) {
  const colors = useThemeColors();
  const tint = active && activeColor ? activeColor : colors.textMuted;
  return (
    <PressableScale haptic="light" onPress={onPress}>
      <View className="flex-row items-center gap-1.5">
        <Icon size={18} color={tint} fill={active && activeColor ? activeColor : 'transparent'} />
        <Text className="font-body-medium text-[13px] tabular-nums" style={{ color: tint }}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

function Avatar({ initial, uri }: { initial: string; uri?: string | null }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: 36, height: 36, borderRadius: 18 }}
        contentFit="cover"
      />
    );
  }
  return (
    <View className="w-9 h-9 rounded-full items-center justify-center bg-brand-tint dark:bg-brand-dark-tint">
      <Text className="font-heading text-[13px] text-brand dark:text-brand-dark">{initial}</Text>
    </View>
  );
}
