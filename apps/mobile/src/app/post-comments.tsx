import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Flag, Reply, Send, Trash2, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { formatTimeAgo } from '@/data/discover';
import { useReport } from '@/hooks/use-report';
import {
  addComment,
  deleteComment,
  fetchComments,
  type CommentView,
} from '@/services/supabase/posts';
import { useAuth } from '@/store/auth';
import { accentLime, onAccentLime, useThemeColors } from '@/theme';

const SHEET_RATIO = 0.56;
const CLOSE_DISTANCE = 130;
const CLOSE_VELOCITY = 900;
const OPEN_MS = 240;
const CLOSE_MS = 200;
const BACKDROP_MAX_OPACITY = 0.4;
const QUICK_EMOJIS = ['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂'];

export default function PostCommentsScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const inputRef = useRef<TextInput>(null);

  const sheetHeight = Math.round(height * SHEET_RATIO);
  const translateY = useSharedValue(sheetHeight);

  const [comments, setComments] = useState<CommentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<CommentView | null>(null);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: OPEN_MS });
  }, [translateY]);

  const goBack = useCallback(() => router.back(), [router]);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(sheetHeight, { duration: CLOSE_MS }, (finished) => {
      if (finished) runOnJS(goBack)();
    });
  }, [translateY, sheetHeight, goBack]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_DISTANCE || e.velocityY > CLOSE_VELOCITY) {
        translateY.value = withTiming(sheetHeight, { duration: CLOSE_MS }, (finished) => {
          if (finished) runOnJS(goBack)();
        });
      } else {
        translateY.value = withTiming(0, { duration: 160 });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, sheetHeight],
      [BACKDROP_MAX_OPACITY, 0],
      Extrapolation.CLAMP,
    ),
  }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  const load = useCallback(async () => {
    const myId = useAuth.getState().userId;
    if (!myId || !postId) return;
    try {
      setComments(await fetchComments(postId, myId));
    } catch {
    }
  }, [postId]);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  const { tops, repliesByParent } = useMemo(() => {
    const tops: CommentView[] = [];
    const map = new Map<string, CommentView[]>();
    for (const c of comments) {
      if (c.parentId) {
        const arr = map.get(c.parentId) ?? [];
        arr.push(c);
        map.set(c.parentId, arr);
      } else {
        tops.push(c);
      }
    }
    return { tops, repliesByParent: map };
  }, [comments]);

  const startReply = (target: CommentView) => {
    setReplyTo(target);
    inputRef.current?.focus();
  };

  const onSend = async () => {
    const body = draft.trim();
    const myId = useAuth.getState().userId;
    if (!body || !postId || !myId || sending) return;
    const parentId = replyTo ? (replyTo.parentId ?? replyTo.id) : null;
    setSending(true);
    try {
      await addComment(postId, myId, body, parentId);
      setDraft('');
      setReplyTo(null);
      await load();
    } catch {
      Alert.alert(t('discover.commentFailedTitle'), t('discover.saveFailed'));
    } finally {
      setSending(false);
    }
  };

  const onDelete = (id: string) =>
    Alert.alert(t('discover.commentDeleteTitle'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('history.delete'),
        style: 'destructive',
        onPress: async () => {
          setComments((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
          try {
            await deleteComment(id);
          } catch {
            void load();
          }
        },
      },
    ]);

  return (
    <View className="flex-1 justify-end">
      <Animated.View style={[{ position: 'absolute', inset: 0, backgroundColor: '#000' }, backdropStyle]}>
        <Pressable className="flex-1" onPress={dismiss} accessibilityLabel={t('common.cancel')} />
      </Animated.View>

      <Animated.View
        style={[{ height: sheetHeight }, sheetStyle]}
        className="rounded-t-[28px] overflow-hidden bg-cream dark:bg-[#0C0F0C]">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
          className="flex-1">
          <GestureDetector gesture={pan}>
            <View className="pt-2.5 pb-3 items-center border-b border-border dark:border-border-dark">
              <View className="w-10 h-1 rounded-full bg-ink-muted/40 dark:bg-ink-dark-muted/40 mb-3" />
              <Text className="font-heading text-[16px] tracking-tight text-ink dark:text-ink-dark">
                {t('discover.commentsTitle')}
              </Text>
            </View>
          </GestureDetector>

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.textMuted} />
            </View>
          ) : (
            <FlatList
              data={tops}
              keyExtractor={(c) => c.id}
              contentContainerStyle={{ padding: 16, gap: 18, flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View className="items-center pt-10">
                  <Text className="font-body-medium text-sm text-ink-muted dark:text-ink-dark-muted">
                    {t('discover.commentsEmpty')}
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View className="gap-3">
                  <CommentRow
                    comment={item}
                    onReply={() => startReply(item)}
                    onDelete={() => onDelete(item.id)}
                  />
                  {(repliesByParent.get(item.id) ?? []).map((reply) => (
                    <View key={reply.id} className="pl-11">
                      <CommentRow
                        comment={reply}
                        isReply
                        onReply={() => startReply(reply)}
                        onDelete={() => onDelete(reply.id)}
                      />
                    </View>
                  ))}
                </View>
              )}
            />
          )}

          {replyTo && (
            <View className="flex-row items-center justify-between px-4 py-2 bg-surface dark:bg-surface-raised-dark border-t border-border dark:border-border-dark">
              <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">
                {t('discover.replyingTo', { name: replyTo.authorName || t('profile.guest') })}
              </Text>
              <PressableScale
                haptic="light"
                onPress={() => setReplyTo(null)}
                accessibilityLabel={t('common.cancel')}>
                <X size={18} color={colors.textMuted} />
              </PressableScale>
            </View>
          )}

          <View className="flex-row items-center justify-between px-4 pt-2 border-t border-border dark:border-border-dark">
            {QUICK_EMOJIS.map((emoji) => (
              <PressableScale
                key={emoji}
                haptic="light"
                onPress={() => setDraft((d) => d + emoji)}
                accessibilityLabel={emoji}>
                <Text className="text-[24px]">{emoji}</Text>
              </PressableScale>
            ))}
          </View>

          <View
            className="flex-row items-end gap-2 px-4 pt-2"
            style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
            <View className="flex-1 rounded-2xl px-3.5 py-2 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
              <TextInput
                ref={inputRef}
                value={draft}
                onChangeText={setDraft}
                placeholder={
                  replyTo ? t('discover.replyPlaceholder') : t('discover.commentPlaceholder')
                }
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={500}
                className="max-h-24 font-body text-[15px] leading-[20px] text-ink dark:text-ink-dark"
              />
            </View>
            <PressableScale
              haptic="light"
              onPress={onSend}
              disabled={draft.trim().length === 0 || sending}
              accessibilityLabel={t('discover.commentSend')}
              style={{ opacity: draft.trim().length === 0 || sending ? 0.4 : 1 }}>
              <View
                className="w-11 h-11 rounded-full items-center justify-center"
                style={{ backgroundColor: accentLime }}>
                <Send size={18} color={onAccentLime} />
              </View>
            </PressableScale>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

function CommentRow({
  comment,
  isReply,
  onReply,
  onDelete,
}: {
  comment: CommentView;
  isReply?: boolean;
  onReply: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const promptReport = useReport();
  const name = comment.authorName || t('profile.guest');
  const initial = (name.trim()[0] ?? '?').toLocaleUpperCase('tr');
  const size = isReply ? 28 : 36;

  return (
    <View className="flex-row items-start gap-3">
      {comment.authorAvatarUrl ? (
        <Image
          source={{ uri: comment.authorAvatarUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{ width: size, height: size }}
          className="rounded-full items-center justify-center bg-brand-tint dark:bg-brand-dark-tint">
          <Text className="font-heading text-[12px] text-brand dark:text-brand-dark">
            {initial}
          </Text>
        </View>
      )}
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="font-heading text-[14px] text-ink dark:text-ink-dark">{name}</Text>
          <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted">
            {formatTimeAgo(comment.createdAt, t)}
          </Text>
        </View>
        <Text className="font-body text-[14px] leading-[19px] text-ink dark:text-ink-dark">
          {comment.body}
        </Text>
        <PressableScale haptic="light" onPress={onReply} accessibilityLabel={t('discover.reply')}>
          <View className="flex-row items-center gap-1 pt-0.5">
            <Reply size={13} color={colors.textMuted} />
            <Text className="font-body-medium text-[12px] text-ink-muted dark:text-ink-dark-muted">
              {t('discover.reply')}
            </Text>
          </View>
        </PressableScale>
      </View>
      {comment.isMine ? (
        <PressableScale haptic="light" onPress={onDelete} accessibilityLabel={t('history.delete')}>
          <Trash2 size={16} color={colors.textMuted} />
        </PressableScale>
      ) : (
        <PressableScale
          haptic="light"
          onPress={() => promptReport('comment', comment.id)}
          accessibilityLabel={t('report.title')}>
          <Flag size={15} color={colors.textMuted} />
        </PressableScale>
      )}
    </View>
  );
}
