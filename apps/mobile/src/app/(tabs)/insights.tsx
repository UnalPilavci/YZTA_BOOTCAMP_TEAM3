import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowUp, ArrowUpRight, ChevronRight, Newspaper, Search, Users } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/discover/post-card';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Reveal } from '@/components/ui/reveal';
import { SegmentControl, type SegmentItem } from '@/components/ui/segment-control';
import { BLOG_FILTERS, CAT_META, type BlogCat } from '@/data/discover';
import { useRealtimeInsert } from '@/hooks/use-realtime';
import { fetchArticles, type Article } from '@/services/supabase/articles';
import { fetchFeed, type PostView } from '@/services/supabase/posts';
import { useAuth } from '@/store/auth';
import { accentLime, onAccentLime, useThemeColors } from '@/theme';

type Segment = 'community' | 'blog';

const DISCOVER_SEGMENTS: SegmentItem<Segment>[] = [
  { key: 'community', labelKey: 'discover.tabCommunity', Icon: Users },
  { key: 'blog', labelKey: 'discover.tabBlog', Icon: Newspaper },
];

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const [segment, setSegment] = useState<Segment>('community');

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="px-4 pt-2 pb-3 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-heading text-2xl tracking-tight text-ink dark:text-ink-dark">
              {t('discover.title')}
            </Text>
            <PressableScale
              haptic="light"
              accessibilityLabel={t('search.placeholder')}
              onPress={() => router.push('/search')}
              style={{ width: 40, height: 40 }}>
              <View className="w-10 h-10 rounded-full items-center justify-center bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                <Search size={18} color={colors.text} />
              </View>
            </PressableScale>
          </View>

          <SegmentControl segments={DISCOVER_SEGMENTS} value={segment} onChange={setSegment} />
        </View>

        {segment === 'community' ? <CommunityFeed /> : <BlogFeed />}
      </SafeAreaView>
    </View>
  );
}

function CommunityFeed() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const scrollRef = useRef<ScrollView>(null);
  const [posts, setPosts] = useState<PostView[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const myId = useAuth((s) => s.userId);

  const load = useCallback(async () => {
    const uid = useAuth.getState().userId;
    if (!uid) return;
    try {
      setPosts(await fetchFeed(uid));
      setNewCount(0);
    } catch {
    }
  }, []);

  useRealtimeInsert<{ user_id: string; visibility: string }>({
    channelName: 'feed-posts',
    table: 'posts',
    filter: 'visibility=eq.public',
    enabled: !!myId,
    onInsert: (row) => {
      if (row.user_id !== myId) setNewCount((n) => n + 1);
    },
  });

  const onShowNew = useCallback(async () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    await load();
  }, [load]);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const patch = useCallback((id: string, next: Partial<PostView>) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...next } : p)));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center pb-28">
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pb-28 gap-3"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textMuted} />
        }>
        {posts.length === 0 ? (
          <View className="items-center justify-center pt-24 px-8 gap-2">
            <Users size={40} color={colors.textMuted} />
            <Text className="font-heading text-lg text-ink dark:text-ink-dark text-center">
              {t('discover.feedEmptyTitle')}
            </Text>
            <Text className="font-body text-sm text-ink-muted dark:text-ink-dark-muted text-center">
              {t('discover.feedEmptySubtitle')}
            </Text>
          </View>
        ) : (
          posts.map((post, i) => (
            <Reveal key={post.id} index={Math.min(i, 6)}>
              <PostCard post={post} patch={patch} />
            </Reveal>
          ))
        )}
      </ScrollView>

      {newCount > 0 && (
        <View pointerEvents="box-none" className="absolute top-2 left-0 right-0 items-center">
          <PressableScale
            haptic="light"
            accessibilityLabel={t('realtime.newPostsPill', { count: newCount })}
            onPress={onShowNew}>
            <View
              className="flex-row items-center gap-1.5 rounded-pill pl-3 pr-3.5 py-2 shadow-lg"
              style={{ backgroundColor: accentLime }}>
              <ArrowUp size={15} color={onAccentLime} />
              <Text className="font-heading text-[13px]" style={{ color: onAccentLime }}>
                {t('realtime.newPostsPill', { count: newCount })}
              </Text>
            </View>
          </PressableScale>
        </View>
      )}
    </View>
  );
}

function BlogFeed() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const [cat, setCat] = useState<BlogCat>('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      void fetchArticles()
        .then((rows) => active && setArticles(rows))
        .catch(() => {})
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, []),
  );

  const featured = articles.find((a) => a.featured) ?? null;
  const showFeatured = featured != null && (cat === 'all' || cat === featured.category);
  const list = articles.filter(
    (a) => !a.featured && (cat === 'all' || a.category === cat),
  );

  const openArticle = (id: string) => router.push({ pathname: '/article', params: { id } });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-4 pb-28 gap-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 py-1">
        {BLOG_FILTERS.map((f) => (
          <CatChip
            key={f}
            label={t(f === 'all' ? 'discover.catAll' : CAT_META[f].labelKey)}
            active={cat === f}
            onPress={() => setCat(f)}
          />
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.textMuted} className="mt-8" />
      ) : (
        <>
          {showFeatured && featured && (
            <Reveal index={0}>
              <FeaturedCard article={featured} onPress={() => openArticle(featured.id)} />
            </Reveal>
          )}

          {list.length === 0 && !showFeatured ? (
            <Text className="text-center font-body-medium text-sm text-ink-muted dark:text-ink-dark-muted mt-8">
              {t('discover.emptyBlog')}
            </Text>
          ) : (
            <View className="px-0.5">
              {list.map((a, i) => (
                <Reveal key={a.id} index={i + 1}>
                  <ArticleRow article={a} onPress={() => openArticle(a.id)} first={i === 0} />
                </Reveal>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function CatChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale haptic="selection" onPress={onPress} accessibilityLabel={label}>
      <View
        className={`rounded-pill px-4 py-1.5 ${
          active
            ? 'bg-ink dark:bg-lime'
            : 'bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark'
        }`}>
        <Text
          className={`font-body-medium text-[13px] ${
            active
              ? 'text-cream dark:text-[#0C0F0C]'
              : 'text-ink-muted dark:text-ink-dark-muted'
          }`}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

function FeaturedCard({ article, onPress }: { article: Article; onPress: () => void }) {
  const { t } = useTranslation();
  const meta = CAT_META[article.category];
  const Icon = meta.Icon;
  const initial =
    article.authorInitial || (article.authorName.trim()[0] ?? '?').toLocaleUpperCase('tr');
  return (
    <PressableScale haptic="light" onPress={onPress}>
      <View
        className="overflow-hidden rounded-[26px] p-5 gap-3 bg-[#101410] dark:bg-surface-raised-dark"
        style={{ borderLeftWidth: 3, borderLeftColor: accentLime }}>
        <View
          pointerEvents="none"
          className="absolute -top-10 -right-8 w-40 h-40 rounded-full opacity-20"
          style={{ backgroundColor: accentLime }}
        />
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="rounded-pill px-2.5 py-1" style={{ backgroundColor: accentLime }}>
              <Text
                className="font-body-bold text-[10px] tracking-wider"
                style={{ color: onAccentLime }}>
                {t('discover.featured').toLocaleUpperCase('tr')}
              </Text>
            </View>
            <Text
              className="font-body-bold text-[11px] tracking-[1.5px]"
              style={{ color: accentLime }}>
              {t(meta.labelKey).toLocaleUpperCase('tr')}
            </Text>
          </View>
          <Icon size={18} color={accentLime} />
        </View>

        <Text className="font-heading text-[25px] leading-[30px] text-white">{article.title}</Text>
        {!!article.subtitle && (
          <Text className="font-body text-[14px] leading-[20px] text-white/60">
            {article.subtitle}
          </Text>
        )}

        <View className="h-px bg-white/10 mt-1 mb-0.5" />

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <View className="w-7 h-7 rounded-full items-center justify-center bg-white/10">
              <Text className="font-heading text-[11px]" style={{ color: accentLime }}>
                {initial}
              </Text>
            </View>
            <Text className="font-body-medium text-[13px] text-white/85">{article.authorName}</Text>
            <Text className="font-body text-[13px] text-white/40">
              · {t('discover.readTime', { count: article.readMinutes })}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="font-heading text-[12px]" style={{ color: accentLime }}>
              {t('discover.readCta')}
            </Text>
            <ArrowUpRight size={14} color={accentLime} />
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

function ArticleRow({
  article,
  onPress,
  first,
}: {
  article: Article;
  onPress: () => void;
  first: boolean;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const meta = CAT_META[article.category];
  const Icon = meta.Icon;

  return (
    <PressableScale haptic="light" onPress={onPress}>
      <View
        className={`flex-row items-center gap-3.5 py-4 ${
          first ? '' : 'border-t border-border dark:border-border-dark'
        }`}>
        <View className="w-11 h-11 rounded-2xl items-center justify-center bg-[#101410] dark:bg-white/[0.06]">
          <Icon size={20} color={accentLime} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="font-body-bold text-[10px] tracking-[1.5px] text-ink-muted dark:text-ink-dark-muted">
            {t(meta.labelKey).toLocaleUpperCase('tr')}
          </Text>
          <Text
            numberOfLines={2}
            className="font-heading text-[16px] leading-[21px] text-ink dark:text-ink-dark">
            {article.title}
          </Text>
          <Text className="font-body text-[12.5px] text-ink-muted dark:text-ink-dark-muted mt-0.5">
            {article.authorName} · {t('discover.readTimeShort', { count: article.readMinutes })}
          </Text>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </View>
    </PressableScale>
  );
}
