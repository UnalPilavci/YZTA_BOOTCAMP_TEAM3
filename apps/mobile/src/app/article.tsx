import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { StarRating } from '@/components/ui/star-rating';
import { CAT_META } from '@/data/discover';
import { fetchArticle, type Article } from '@/services/supabase/articles';
import {
  fetchArticleRating,
  rateArticle,
  removeArticleRating,
  type ArticleRating,
} from '@/services/supabase/ratings';
import { useAuth } from '@/store/auth';
import { useThemeColors } from '@/theme';

export default function ArticleScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const myId = useAuth((s) => s.userId);
  const [article, setArticle] = useState<Article | null>(null);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [rating, setRating] = useState<ArticleRating | null>(null);

  useEffect(() => {
    let active = true;
    if (!id) {
      setStatus('error');
      return;
    }
    void fetchArticle(id)
      .then((a) => {
        if (!active) return;
        setArticle(a);
        setStatus(a ? 'done' : 'error');
      })
      .catch(() => active && setStatus('error'));
    if (myId) {
      void fetchArticleRating(id, myId)
        .then((r) => active && setRating(r))
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [id, myId]);

  const onRate = async (next: number) => {
    if (!id || !myId || !rating) return;
    const remove = rating.mine === next;
    const prev = rating;
    const sum = prev.average * prev.count;
    const nextCount = remove ? prev.count - 1 : prev.mine === 0 ? prev.count + 1 : prev.count;
    const nextSum = sum - prev.mine + (remove ? 0 : next);
    setRating({
      mine: remove ? 0 : next,
      count: nextCount,
      average: nextCount > 0 ? nextSum / nextCount : 0,
    });
    try {
      if (remove) await removeArticleRating(id, myId);
      else await rateArticle(id, myId, next);
    } catch {
      setRating(prev);
    }
  };

  const meta = article ? CAT_META[article.category] : null;
  const initial =
    article && (article.authorInitial || (article.authorName.trim()[0] ?? '?').toLocaleUpperCase('tr'));

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-2">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </PressableScale>
        </View>

        {status === 'loading' && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.textMuted} />
          </View>
        )}

        {status === 'error' && (
          <View className="flex-1 items-center justify-center px-8 gap-3">
            <Text className="font-heading text-lg text-ink dark:text-ink-dark text-center">
              {t('discover.articleMissing')}
            </Text>
            <PressableScale haptic="light" onPress={() => router.back()}>
              <Text className="font-body-medium text-[15px]" style={{ color: colors.text }}>
                {t('common.back')}
              </Text>
            </PressableScale>
          </View>
        )}

        {status === 'done' && article && meta && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-4 pb-10 gap-4">
            <View
              className="self-start flex-row items-center gap-1.5 rounded-pill px-3 py-1"
              style={{ backgroundColor: meta.tint }}>
              <meta.Icon size={14} color={meta.color} />
              <Text
                className="font-body-bold text-[10px] tracking-wider"
                style={{ color: meta.color }}>
                {t(meta.labelKey).toLocaleUpperCase('tr')}
              </Text>
            </View>

            <Text className="font-heading text-[26px] leading-[32px] text-ink dark:text-ink-dark">
              {article.title}
            </Text>

            <View className="flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-full items-center justify-center bg-brand-tint dark:bg-brand-dark-tint">
                <Text className="font-heading text-[12px] text-brand dark:text-brand-dark">
                  {initial}
                </Text>
              </View>
              <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                {article.authorName}
              </Text>
              <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">·</Text>
              <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">
                {t('discover.readTime', { count: article.readMinutes })}
              </Text>
            </View>

            {!!article.subtitle && (
              <Text className="font-body-medium text-[16px] leading-[24px] text-ink-muted dark:text-ink-dark-muted">
                {article.subtitle}
              </Text>
            )}

            <View className="h-px bg-border dark:bg-border-dark" />

            <Text className="font-body text-[16px] leading-[26px] text-ink dark:text-ink-dark">
              {article.body}
            </Text>

            {rating && (
              <View className="rounded-2xl p-4 gap-3 mt-2 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                <View className="flex-row items-center justify-between">
                  <Text className="font-heading text-[15px] text-ink dark:text-ink-dark">
                    {rating.mine > 0 ? t('article.yourRating') : t('article.rateThis')}
                  </Text>
                  {rating.count > 0 && (
                    <StarRating value={rating.average} count={rating.count} size={13} />
                  )}
                </View>
                <StarRating value={rating.mine} onRate={onRate} size={30} />
                {rating.count === 0 && (
                  <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted">
                    {t('article.beFirst')}
                  </Text>
                )}
              </View>
            )}

            <Text className="font-body text-xs leading-4 text-center text-ink-muted dark:text-ink-dark-muted mt-2">
              {t('result.disclaimer')}
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
