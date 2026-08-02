import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/discover/post-card';
import { PressableScale } from '@/components/ui/pressable-scale';
import { deletePost, fetchUserPosts, type PostView } from '@/services/supabase/posts';
import { useAuth } from '@/store/auth';
import { useThemeColors } from '@/theme';

export default function MyPostsFeedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const { postId, userId } = useLocalSearchParams<{ postId?: string; userId?: string }>();

  const listRef = useRef<FlatList<PostView>>(null);
  const scrolledRef = useRef(false);

  const [posts, setPosts] = useState<PostView[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const myId = useAuth.getState().userId;
    const targetId = userId || myId;
    if (!myId || !targetId) return;
    try {
      setPosts(await fetchUserPosts(targetId, myId));
    } catch {
    }
  }, [userId]);

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

  useEffect(() => {
    if (scrolledRef.current || !posts.length || !postId) return;
    const index = posts.findIndex((p) => p.id === postId);
    if (index <= 0) {
      scrolledRef.current = true;
      return;
    }
    scrolledRef.current = true;
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0 });
    });
  }, [posts, postId]);

  const patch = useCallback((id: string, next: Partial<PostView>) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...next } : p)));
  }, []);

  const onEdit = useCallback(
    (post: PostView) =>
      router.push({
        pathname: '/share-post',
        params: {
          editPostId: post.id,
          eName: post.productName,
          eBody: post.body,
          eScore: String(post.healthScore),
          eKcal: post.kcal != null ? String(post.kcal) : '',
          eImage: post.imageUrl ?? '',
          eVis: post.visibility,
        },
      }),
    [router],
  );

  const onDelete = useCallback(
    (id: string) =>
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
      ]),
    [posts, t],
  );

  const title = userId && posts[0]?.authorName ? posts[0].authorName : t('profile.myPosts');

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-2">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </PressableScale>
          <Text
            numberOfLines={1}
            className="flex-1 font-heading text-2xl tracking-tight text-ink dark:text-ink-dark">
            {title}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center pb-20">
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={posts}
            keyExtractor={(p) => p.id}
            contentContainerClassName="px-4 pt-1 pb-16 gap-3"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PostCard
                post={item}
                patch={patch}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item.id)}
              />
            )}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                listRef.current?.scrollToIndex({
                  index: info.index,
                  animated: false,
                  viewPosition: 0,
                });
              }, 250);
            }}
            ListEmptyComponent={
              <View className="items-center pt-24">
                <Text className="font-body-medium text-sm text-ink-muted dark:text-ink-dark-muted">
                  {t('discover.emptyPosts')}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}
