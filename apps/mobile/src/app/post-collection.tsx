import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Bookmark, Heart } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostTile } from '@/components/discover/post-tile';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Reveal } from '@/components/ui/reveal';
import {
  fetchBookmarkedPosts,
  fetchLikedPosts,
  setBookmark,
  setLike,
  type PostView,
} from '@/services/supabase/posts';
import { useAuth } from '@/store/auth';
import { useThemeColors } from '@/theme';

type Mode = 'liked' | 'saved';

export default function PostCollectionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const mode: Mode = modeParam === 'saved' ? 'saved' : 'liked';

  const myId = useAuth((s) => s.userId);
  const [posts, setPosts] = useState<PostView[]>([]);
  const [loading, setLoading] = useState(true);

  const didLoad = useRef(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const firstLoad = !didLoad.current;
      void (async () => {
        if (!myId) return;
        if (firstLoad) setLoading(true);
        try {
          const data =
            mode === 'saved' ? await fetchBookmarkedPosts(myId) : await fetchLikedPosts(myId);
          if (active) setPosts(data);
        } catch {
        } finally {
          didLoad.current = true;
          if (active && firstLoad) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [myId, mode]),
  );

  const onRemove = (postId: string) => {
    if (!myId) return;
    const backup = posts;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    const call = mode === 'saved' ? setBookmark(postId, myId, false) : setLike(postId, myId, false);
    void call.catch(() => setPosts(backup));
  };

  const title = t(mode === 'saved' ? 'discoverSettings.savedPosts' : 'discoverSettings.likedPosts');
  const EmptyIcon = mode === 'saved' ? Bookmark : Heart;
  const emptyText = t(mode === 'saved' ? 'collections.emptySaved' : 'collections.emptyLiked');

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
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

        {loading ? (
          <View className="flex-1 items-center justify-center pb-20">
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : posts.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10 gap-3 pb-20">
            <EmptyIcon size={40} color={colors.textMuted} />
            <Text className="text-center font-body-medium text-[14px] text-ink-muted dark:text-ink-dark-muted">
              {emptyText}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-4 pt-3 pb-10">
            <View className="flex-row flex-wrap justify-between gap-y-3">
              {posts.map((post, i) => (
                <View key={post.id} className="w-[48.5%]">
                  <Reveal index={i} delayStep={40}>
                    <PostTile
                      post={post}
                      onPress={() =>
                        router.push({ pathname: '/post-comments', params: { postId: post.id } })
                      }
                      onRemove={() => onRemove(post.id)}
                      removeLabel={t(mode === 'saved' ? 'collections.removeSaved' : 'collections.removeLiked')}
                    />
                  </Reveal>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
