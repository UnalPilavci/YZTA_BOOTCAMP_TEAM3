import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import {
  DICTIONARY,
  pickText,
  searchDictionary,
  type DictionaryCategory,
  type DictionaryEntry,
} from '@/data/dictionary';
import { stateColors, useThemeColors } from '@/theme';

const RISK_COLOR: Record<DictionaryEntry['risk'], string> = {
  safe: stateColors.safe,
  caution: stateColors.caution,
  risk: stateColors.risk,
};

type FilterId = 'all' | 'safe' | 'caution' | `cat:${DictionaryCategory}`;

const CATEGORIES: DictionaryCategory[] = [
  ...new Set(DICTIONARY.map((e) => e.category)),
];

export default function DictionaryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');

  const results = useMemo(() => {
    const base = searchDictionary(query);
    if (filter === 'all') return base;
    if (filter === 'safe') return base.filter((e) => e.risk === 'safe');
    if (filter === 'caution') return base.filter((e) => e.risk === 'caution');
    const cat = filter.slice(4) as DictionaryCategory;
    return base.filter((e) => e.category === cat);
  }, [query, filter]);

  return (
    <View className="flex-1 bg-surface dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-3">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}>
            <View className="w-10 h-10 rounded-full items-center justify-center bg-white dark:bg-surface-raised-dark border border-border dark:border-border-dark">
              <ArrowLeft size={20} color={colors.text} />
            </View>
          </PressableScale>
          <View className="flex-1">
            <Text className="font-heading text-2xl tracking-tight text-ink dark:text-ink-dark">
              {t('dictionary.title')}
            </Text>
            <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">
              {t('dictionary.count', { count: DICTIONARY.length })}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2.5 mx-4 h-12 rounded-2xl px-3.5 bg-white dark:bg-surface-raised-dark border border-border dark:border-border-dark">
          <Search size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('dictionary.searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            className="flex-1 font-body text-[15px] text-ink dark:text-ink-dark"
          />
          {query.length > 0 && (
            <PressableScale
              haptic="selection"
              accessibilityLabel={t('common.close')}
              onPress={() => setQuery('')}>
              <X size={18} color={colors.textMuted} />
            </PressableScale>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-4 py-3"
          className="grow-0 shrink-0">
          <FilterChip
            label={t('dictionary.filterAll')}
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterChip
            label={t('dictionary.filterSafe')}
            dot={stateColors.safe}
            active={filter === 'safe'}
            onPress={() => setFilter('safe')}
          />
          <FilterChip
            label={t('dictionary.filterCaution')}
            dot={stateColors.caution}
            active={filter === 'caution'}
            onPress={() => setFilter('caution')}
          />
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={t(`dictionary.cat.${cat}`)}
              active={filter === `cat:${cat}`}
              onPress={() => setFilter(`cat:${cat}`)}
            />
          ))}
        </ScrollView>

        {results.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-2 px-8 pb-16">
            <Search size={44} color={colors.textMuted} />
            <Text className="font-heading text-lg text-ink dark:text-ink-dark">
              {t('dictionary.emptyTitle')}
            </Text>
            <Text className="font-body text-[13px] leading-5 text-center text-ink-muted dark:text-ink-dark-muted">
              {t('dictionary.emptySubtitle')}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="px-4 pb-16 gap-2.5">
            {results.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onPress={() =>
                  router.push({ pathname: '/ingredient', params: { id: entry.id } })
                }
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function FilterChip({
  label,
  dot,
  active,
  onPress,
}: {
  label: string;
  dot?: string;
  active: boolean;
  onPress: () => void;
}) {
  const tintStyle =
    dot && !active
      ? { backgroundColor: `${dot}1F`, borderColor: 'transparent' }
      : undefined;
  const activeTint = dot && active ? { borderColor: dot } : undefined;

  return (
    <PressableScale haptic="selection" accessibilityLabel={label} onPress={onPress}>
      <View
        className={`flex-row items-center gap-1.5 h-9 rounded-pill px-3.5 border ${
          active && !dot
            ? 'bg-[#101410] dark:bg-lime border-transparent'
            : 'bg-white dark:bg-surface-raised-dark border-border dark:border-border-dark'
        } ${dot && active ? 'border-2' : ''}`}
        style={[tintStyle, activeTint]}>
        {dot && (
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: dot }}
          />
        )}
        <Text
          className={`font-body-medium text-[13px] ${
            active && !dot
              ? 'text-cream dark:text-lime-on'
              : 'text-ink dark:text-ink-dark'
          }`}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

function EntryRow({
  entry,
  onPress,
}: {
  entry: DictionaryEntry;
  onPress: () => void;
}) {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const riskColor = RISK_COLOR[entry.risk];

  return (
    <PressableScale
      haptic="light"
      accessibilityLabel={`${entry.code}, ${pickText(entry.name, i18n.language)}`}
      onPress={onPress}>
      <View className="flex-row items-center gap-3 rounded-2xl p-3 bg-white dark:bg-surface-raised-dark border border-border dark:border-border-dark">
        <View className="min-w-[54px] h-[54px] rounded-xl items-center justify-center px-2 bg-[#101410] dark:bg-[#0C0F0C]">
          <Text className="font-body-bold text-[13px] text-cream">
            {entry.code}
          </Text>
        </View>

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-heading text-[15px] text-ink dark:text-ink-dark">
            {pickText(entry.name, i18n.language)}
          </Text>
          <Text
            numberOfLines={2}
            className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted mt-0.5">
            {t(`dictionary.cat.${entry.category}`)}
          </Text>
        </View>

        <View
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: riskColor }}
        />
        <ChevronRight size={16} color={colors.textMuted} />
      </View>
    </PressableScale>
  );
}
