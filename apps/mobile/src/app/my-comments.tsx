import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, Trash2 } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Reveal } from '@/components/ui/reveal';
import { deleteComment, fetchMyComments, type MyCommentView } from '@/services/supabase/posts';
import { useAuth } from '@/store/auth';
import { getScore, useThemeColors } from '@/theme';

export default function MyCommentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const myId = useAuth((s) => s.userId);

  const [comments, setComments] = useState<MyCommentView[]>([]);
  const [loading, setLoading] = useState(true);

  const onDelete = (id: string) =>
    Alert.alert(t('myComments.deleteTitle'), t('myComments.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('history.delete'),
        style: 'destructive',
        onPress: () => {
          const backup = comments;
          setComments((prev) => prev.filter((c) => c.id !== id));
          void deleteComment(id).catch(() => setComments(backup));
        },
      },
    ]);

  const didLoad = useRef(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const firstLoad = !didLoad.current;
      void (async () => {
        if (!myId) return;
        if (firstLoad) setLoading(true);
        try {
          const data = await fetchMyComments(myId);
          if (active) setComments(data);
        } catch {
        } finally {
          didLoad.current = true;
          if (active && firstLoad) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [myId]),
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
            {t('discoverSettings.myComments')}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center pb-20">
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : comments.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10 gap-3 pb-20">
            <MessageCircle size={40} color={colors.textMuted} />
            <Text className="text-center font-body-medium text-[14px] text-ink-muted dark:text-ink-dark-muted">
              {t('myComments.empty')}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-4 pt-3 pb-10 gap-3">
            {comments.map((c, i) => (
              <Reveal key={c.id} index={i} delayStep={40}>
                <CommentCard
                  comment={c}
                  onPress={() =>
                    router.push({ pathname: '/post-comments', params: { postId: c.postId } })
                  }
                  onDelete={() => onDelete(c.id)}
                />
              </Reveal>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function CommentCard({
  comment,
  onPress,
  onDelete,
}: {
  comment: MyCommentView;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { color } = getScore(comment.postHealthScore);
  return (
    <PressableScale haptic="light" accessibilityLabel={comment.body} onPress={onPress}>
      <View className="rounded-2xl p-3.5 gap-2 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
        <View className="flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <Text
            numberOfLines={1}
            className="flex-1 font-body-medium text-[12.5px] text-ink-muted dark:text-ink-dark-muted">
            {comment.postProductName}
          </Text>
          <PressableScale
            haptic="medium"
            accessibilityLabel={t('myComments.deleteTitle')}
            onPress={onDelete}
            style={{ padding: 4 }}>
            <Trash2 size={16} color={colors.textMuted} />
          </PressableScale>
        </View>
        <Text className="font-body text-[14px] leading-[20px] text-ink dark:text-ink-dark">
          {comment.body}
        </Text>
      </View>
    </PressableScale>
  );
}
