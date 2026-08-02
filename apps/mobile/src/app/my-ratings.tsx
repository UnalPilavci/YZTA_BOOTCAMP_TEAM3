import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, Star, Trash2 } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Reveal } from '@/components/ui/reveal';
import { StarRating } from '@/components/ui/star-rating';
import { CAT_META } from '@/data/discover';
import {
  fetchMyRatings,
  removeArticleRating,
  type MyRatingView,
} from '@/services/supabase/ratings';
import { useAuth } from '@/store/auth';
import { useThemeColors } from '@/theme';

export default function MyRatingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const myId = useAuth((s) => s.userId);

  const [ratings, setRatings] = useState<MyRatingView[]>([]);
  const [loading, setLoading] = useState(true);

  const onRemove = (articleId: string) => {
    if (!myId) return;
    const backup = ratings;
    setRatings((prev) => prev.filter((r) => r.articleId !== articleId));
    void removeArticleRating(articleId, myId).catch(() => setRatings(backup));
  };

  const didLoad = useRef(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const firstLoad = !didLoad.current;
      void (async () => {
        if (!myId) return;
        if (firstLoad) setLoading(true);
        try {
          const data = await fetchMyRatings(myId);
          if (active) setRatings(data);
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
            {t('discoverSettings.myRatings')}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center pb-20">
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : ratings.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10 gap-3 pb-20">
            <Star size={40} color={colors.textMuted} />
            <Text className="text-center font-body-medium text-[14px] text-ink-muted dark:text-ink-dark-muted">
              {t('myRatings.empty')}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-4 pt-3 pb-10 gap-3">
            {ratings.map((r, i) => (
              <Reveal key={r.articleId} index={i} delayStep={40}>
                <RatingCard
                  rating={r}
                  onPress={() =>
                    router.push({ pathname: '/article', params: { id: r.articleId } })
                  }
                  onRemove={() => onRemove(r.articleId)}
                />
              </Reveal>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function RatingCard({
  rating,
  onPress,
  onRemove,
}: {
  rating: MyRatingView;
  onPress: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const meta = (CAT_META as Record<string, (typeof CAT_META)['recipes'] | undefined>)[
    rating.category
  ];

  return (
    <PressableScale haptic="light" accessibilityLabel={rating.title} onPress={onPress}>
      <View className="rounded-2xl p-3.5 gap-2 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
        <View className="flex-row items-start gap-2">
          <View className="flex-1 gap-2">
            {meta && (
              <View
                className="self-start flex-row items-center gap-1.5 rounded-pill px-2.5 py-0.5"
                style={{ backgroundColor: meta.tint }}>
                <meta.Icon size={12} color={meta.color} />
                <Text
                  className="font-body-bold text-[9px] tracking-wider"
                  style={{ color: meta.color }}>
                  {t(meta.labelKey).toLocaleUpperCase('tr')}
                </Text>
              </View>
            )}
            <Text
              numberOfLines={2}
              className="font-heading text-[15px] leading-[20px] text-ink dark:text-ink-dark">
              {rating.title}
            </Text>
          </View>
          <PressableScale
            haptic="medium"
            accessibilityLabel={t('myRatings.remove')}
            onPress={onRemove}
            style={{ padding: 4 }}>
            <Trash2 size={16} color={colors.textMuted} />
          </PressableScale>
        </View>
        <StarRating value={rating.rating} size={16} />
      </View>
    </PressableScale>
  );
}
