import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { Flame, MapPin, Plus, Search, Sparkles, Star, Users, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Reveal } from '@/components/ui/reveal';
import { SegmentControl, type SegmentItem } from '@/components/ui/segment-control';
import { formatTimeAgo } from '@/data/discover';
import { estimateCaloriesPerMinute } from '@/data/exercises';
import { ALL_SPECIALTIES, SPECIALTY_EMOJI } from '@/data/trainer-options';
import { useExerciseLibrary, type ResolvedExercise } from '@/hooks/use-exercise-library';
import { useHasFeature } from '@/hooks/use-plan';
import { fetchListings, type ListingView, type RoleType } from '@/services/supabase/listings';
import { useAuth } from '@/store/auth';
import { useExercisesStore } from '@/store/exercises';
import { useProfile } from '@/store/profile';
import { accentLime, onAccentLime, useThemeColors } from '@/theme';

type FitnessSegment = 'ai' | 'listings';

const FITNESS_SEGMENTS: SegmentItem<FitnessSegment>[] = [
  { key: 'ai', labelKey: 'fitness.tabAi', Icon: Sparkles },
  { key: 'listings', labelKey: 'fitness.tabListings', Icon: Users },
];

export default function FitnessScreen() {
  const { t } = useTranslation();
  const [segment, setSegment] = useState<FitnessSegment>('ai');

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="px-4 pt-2 pb-3 gap-3">
          <Text className="font-heading text-2xl tracking-tight text-ink dark:text-ink-dark">
            {t('fitness.title')}
          </Text>
          <SegmentControl segments={FITNESS_SEGMENTS} value={segment} onChange={setSegment} />
        </View>

        {segment === 'ai' ? <ExerciseLibrary /> : <ListingsFeed />}
      </SafeAreaView>
    </View>
  );
}

const GRID_GAP = 14;
const GRID_H_PADDING = 16;
const GRID_COLUMNS = 2;
const REFERENCE_MINUTES = 10;

type ExerciseFilter = string;

function ExerciseLibrary() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const { width: windowWidth } = useWindowDimensions();
  const weightKgRaw = useProfile((s) => s.weightKg);
  const favorites = useProfile((s) => s.favoriteExercises);
  const toggleFavorite = useProfile((s) => s.toggleFavoriteExercise);
  const [category, setCategory] = useState<ExerciseFilter>('all');
  const [search, setSearch] = useState('');

  const { categories, exercises } = useExerciseLibrary();

  useEffect(() => {
    void useExercisesStore.getState().syncFromServer();
  }, []);

  const weightKg = weightKgRaw ? Number.parseInt(weightKgRaw, 10) : null;
  const cardWidth =
    (windowWidth - GRID_H_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  const list = useMemo(() => {
    let items =
      category === 'favorites'
        ? exercises.filter((e) => favorites.includes(e.id))
        : category === 'all'
          ? exercises
          : exercises.filter((e) => e.categoryId === category);
    const q = search.trim().toLocaleLowerCase('tr');
    if (q) {
      items = items.filter((e) => e.name.toLocaleLowerCase('tr').includes(q));
    }
    return items;
  }, [category, search, favorites, exercises]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="px-4 pb-28 gap-3">
      <View className="flex-row items-center gap-2.5 h-11 rounded-xl px-3.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
        <Search size={18} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('fitness.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          className="flex-1 font-body text-[15px] text-ink dark:text-ink-dark"
          autoCapitalize="none"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={10} accessibilityLabel={t('common.close')}>
            <X size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-2 py-1">
        <SpecialtyChip
          label={`⭐ ${t('fitness.favorites')}`}
          active={category === 'favorites'}
          onPress={() => setCategory('favorites')}
        />
        <SpecialtyChip
          label={t('listings.filterAll')}
          active={category === 'all'}
          onPress={() => setCategory('all')}
        />
        {categories.map((c) => (
          <SpecialtyChip
            key={c.id}
            label={c.label}
            active={category === c.id}
            onPress={() => setCategory(c.id)}
          />
        ))}
      </ScrollView>

      {list.length === 0 ? (
        <View className="items-center justify-center pt-16 px-8 gap-2">
          <Star size={40} color={colors.textMuted} />
          <Text className="font-heading text-base text-ink dark:text-ink-dark text-center">
            {category === 'favorites' && !search
              ? t('fitness.emptyFavorites')
              : t('fitness.emptySearch')}
          </Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap" style={{ gap: GRID_GAP }}>
          {list.map((exercise, i) => (
            <Reveal key={exercise.id} index={Math.min(i, 8)} style={{ width: cardWidth }}>
              <ExerciseCard
                exercise={exercise}
                weightKg={Number.isFinite(weightKg) ? weightKg : null}
                cardWidth={cardWidth}
                isFavorite={favorites.includes(exercise.id)}
                onToggleFavorite={() => toggleFavorite(exercise.id)}
                onPress={() =>
                  router.push({ pathname: '/exercise-detail', params: { id: exercise.id } })
                }
              />
            </Reveal>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function ExerciseCard({
  exercise,
  weightKg,
  cardWidth,
  isFavorite,
  onToggleFavorite,
  onPress,
}: {
  exercise: ResolvedExercise;
  weightKg: number | null;
  cardWidth: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const kcal = Math.round(estimateCaloriesPerMinute(exercise.met, weightKg) * REFERENCE_MINUTES);

  return (
    <PressableScale haptic="light" onPress={onPress}>
      <View
        className="rounded-[24px] bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark p-3"
        style={{ width: cardWidth, gap: 10 }}>
        <View className="relative">
          <View
            className="w-full overflow-hidden rounded-[18px]"
            style={{ aspectRatio: 1, backgroundColor: '#0E1114' }}>
            <Image
              source={exercise.image}
              contentFit="contain"
              style={{ width: '100%', height: '100%' }}
            />
          </View>
          <View className="absolute top-2 right-2 rounded-pill px-2 py-0.5 bg-black/10 dark:bg-white/10">
            <Text className="font-body-medium text-[10px] text-ink-muted dark:text-ink-dark-muted">
              {t('fitness.minutesBadge', { minutes: REFERENCE_MINUTES })}
            </Text>
          </View>
          <Pressable
            onPress={onToggleFavorite}
            hitSlop={8}
            accessibilityLabel={t('fitness.favorites')}
            className="absolute top-1.5 left-1.5 w-8 h-8 items-center justify-center rounded-full bg-black/25">
            <Star
              size={17}
              color={isFavorite ? accentLime : '#FFFFFF'}
              fill={isFavorite ? accentLime : 'transparent'}
            />
          </Pressable>
        </View>

        <Text numberOfLines={1} className="font-heading text-[15px] text-ink dark:text-ink-dark">
          {exercise.name}
        </Text>

        <View className="flex-row items-center gap-1.5">
          <Flame size={13} color="#F2A73B" />
          <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted">
            {t('fitness.kcalShort', { count: kcal })}
          </Text>
        </View>

        <View
          className="w-full items-center justify-center rounded-pill bg-[#101410] dark:bg-lime"
          style={{ height: 40 }}>
          <Text className="font-heading text-[13px] text-lime dark:text-lime-on">
            {t('fitness.startCta')}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}

const SPECIALTY_FILTERS: (string | 'all')[] = ['all', ...ALL_SPECIALTIES.map((s) => s.id)];

function ListingsFeed() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const canPost = useHasFeature('listings');
  const [listings, setListings] = useState<ListingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [specialty, setSpecialty] = useState<string | 'all'>('all');

  const load = useCallback(async () => {
    const myId = useAuth.getState().userId;
    if (!myId) return;
    try {
      setListings(await fetchListings(myId));
    } catch {
    }
  }, []);

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

  const filtered =
    specialty === 'all' ? listings : listings.filter((l) => l.specialties.includes(specialty));

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center pb-28">
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-4 pb-28 gap-3"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textMuted} />
      }>
      {canPost ? (
        <PressableScale haptic="light" onPress={() => router.push('/create-listing')}>
          <View className="flex-row items-center justify-center gap-2 h-12 rounded-2xl bg-[#101410] dark:bg-lime">
            <Plus size={18} color={onAccentLime} />
            <Text className="font-heading text-[14px] text-lime dark:text-lime-on">
              {t('listings.createCta')}
            </Text>
          </View>
        </PressableScale>
      ) : (
        <PressableScale haptic="light" onPress={() => router.push('/plans')}>
          <View className="rounded-2xl p-3.5 gap-1 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
            <Text className="font-heading text-[14px] text-ink dark:text-ink-dark">
              {t('listings.becomeProviderBanner')}
            </Text>
            <Text className="font-body text-[12.5px] text-ink-muted dark:text-ink-dark-muted">
              {t('listings.becomeProviderHint')}
            </Text>
            <Text className="font-body-medium text-[13px] mt-0.5" style={{ color: accentLime }}>
              {t('listings.becomeProviderCta')} →
            </Text>
          </View>
        </PressableScale>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 py-1">
        {SPECIALTY_FILTERS.map((s) => (
          <SpecialtyChip
            key={s}
            label={s === 'all' ? t('listings.filterAll') : t(`options.specialties.${s}`)}
            active={specialty === s}
            onPress={() => setSpecialty(s)}
          />
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View className="items-center justify-center pt-16 px-8 gap-2">
          <Users size={40} color={colors.textMuted} />
          <Text className="font-heading text-lg text-ink dark:text-ink-dark text-center">
            {t('listings.empty')}
          </Text>
        </View>
      ) : (
        filtered.map((listing, i) => (
          <Reveal key={listing.id} index={Math.min(i, 6)}>
            <ListingCard listing={listing} />
          </Reveal>
        ))
      )}
    </ScrollView>
  );
}

function SpecialtyChip({
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
            active ? 'text-cream dark:text-[#0C0F0C]' : 'text-ink-muted dark:text-ink-dark-muted'
          }`}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

const ROLE_LABEL_KEY: Record<RoleType, string> = {
  trainer: 'options.roleTypes.trainer',
  dietitian: 'options.roleTypes.dietitian',
};

function ListingCard({ listing }: { listing: ListingView }) {
  const { t } = useTranslation();
  const router = useRouter();
  const name = listing.authorName || t('profile.guest');
  const initial = (name.trim()[0] ?? '?').toLocaleUpperCase('tr');

  return (
    <PressableScale
      haptic="light"
      onPress={() => router.push({ pathname: '/listing-detail', params: { listingId: listing.id } })}>
      <Card className="p-4 gap-3" elevation="none">
        <View className="flex-row items-center gap-3">
          <Avatar initial={initial} uri={listing.authorAvatarUrl} size={36} />
          <View className="flex-1">
            <Text className="font-heading text-[15px] text-ink dark:text-ink-dark">{name}</Text>
            <Text className="font-body text-xs text-ink-muted dark:text-ink-dark-muted">
              {formatTimeAgo(listing.createdAt, t)}
            </Text>
          </View>
          <View className="rounded-pill px-2.5 py-1 bg-brand-tint dark:bg-brand-dark-tint">
            <Text className="font-body-bold text-[11px] text-brand dark:text-brand-dark">
              {t(ROLE_LABEL_KEY[listing.roleType])}
            </Text>
          </View>
        </View>

        <Text className="font-heading text-[16px] text-ink dark:text-ink-dark">{listing.title}</Text>

        {!!listing.city && (
          <View className="flex-row items-center gap-1.5">
            <MapPin size={13} color={accentLime} />
            <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">
              {listing.city}
            </Text>
          </View>
        )}

        {!!listing.bio && (
          <Text
            numberOfLines={2}
            className="font-body text-[14px] leading-[20px] text-ink dark:text-ink-dark">
            {listing.bio}
          </Text>
        )}

        {listing.specialties.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5">
            {listing.specialties.slice(0, 4).map((id) => (
              <View
                key={id}
                className="flex-row items-center gap-1 rounded-pill px-2.5 py-1 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                {!!SPECIALTY_EMOJI[id] && <Text className="text-[12px]">{SPECIALTY_EMOJI[id]}</Text>}
                <Text className="font-body-medium text-[12px] text-ink-muted dark:text-ink-dark-muted">
                  {t(`options.specialties.${id}`)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </PressableScale>
  );
}
