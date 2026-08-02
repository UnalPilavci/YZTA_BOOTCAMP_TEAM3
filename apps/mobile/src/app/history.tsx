import { useRouter } from 'expo-router';
import type { TFunction } from 'i18next';
import {
  ArrowLeft,
  Flame,
  History,
  Search,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, SectionList, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SegmentControl, type SegmentItem } from '@/components/ui/segment-control';
import { useMeals, type MealRecord } from '@/store/meals';
import { useScans, type ScanRecord } from '@/store/scans';
import { accentMeal, getScore, readableText, stateColors, useThemeColors } from '@/theme';

type Filter = 'all' | 'safe' | 'alerts';
type Tab = 'product' | 'meal';

const HISTORY_TABS: SegmentItem<Tab>[] = [
  { key: 'product', labelKey: 'history.tabProducts', Icon: UtensilsCrossed },
  { key: 'meal', labelKey: 'history.tabMeals', Icon: Flame },
];

type Section<T> = { title: string; count: number; data: T[] };

const startOfDay = (x: Date) =>
  new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();

function buildSections<T extends { id: string; createdAt: number }>(
  items: T[],
  t: TFunction,
): Section<T>[] {
  const today0 = startOfDay(new Date());
  const map = new Map<string, Section<T>>();
  const order: string[] = [];
  for (const s of items) {
    const d = new Date(s.createdAt);
    const days = Math.round((today0 - startOfDay(d)) / 86_400_000);
    let key: string;
    let title: string;
    if (days <= 0) {
      key = 'today';
      title = t('history.today');
    } else if (days === 1) {
      key = 'yesterday';
      title = t('history.yesterday');
    } else {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      key = `${dd}.${mm}.${d.getFullYear()}`;
      title = key;
    }
    let sec = map.get(key);
    if (!sec) {
      sec = { title, count: 0, data: [] };
      map.set(key, sec);
      order.push(key);
    }
    sec.data.push(s);
    sec.count += 1;
  }
  return order.map((k) => map.get(k)!);
}

export default function HistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const scans = useScans((s) => s.scans);
  const removeScan = useScans((s) => s.remove);
  const clearScans = useScans((s) => s.clear);
  const meals = useMeals((s) => s.meals);
  const removeMeal = useMeals((s) => s.remove);
  const clearMeals = useMeals((s) => s.clear);

  const [tab, setTab] = useState<Tab>('product');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const q = query.trim().toLocaleLowerCase('tr');

  const filteredScans = useMemo(() => {
    return scans.filter((s) => {
      const name = (s.productName ?? '').toLocaleLowerCase('tr');
      if (q && !name.includes(q)) return false;
      if (filter === 'safe' && s.personalAlerts.length > 0) return false;
      if (filter === 'alerts' && s.personalAlerts.length === 0) return false;
      return true;
    });
  }, [scans, q, filter]);

  const filteredMeals = useMemo(() => {
    return meals.filter((m) => {
      const name = (m.mealName ?? '').toLocaleLowerCase('tr');
      return !q || name.includes(q);
    });
  }, [meals, q]);

  const scanSections = useMemo(() => buildSections(filteredScans, t), [filteredScans, t]);
  const mealSections = useMemo(() => buildSections(filteredMeals, t), [filteredMeals, t]);

  const isMeal = tab === 'meal';
  const isEmpty = isMeal ? meals.length === 0 : scans.length === 0;

  const confirmClear = () =>
    Alert.alert(t('history.clearConfirmTitle'), t('history.clearConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('history.clearAll'),
        style: 'destructive',
        onPress: isMeal ? clearMeals : clearScans,
      },
    ]);

  const confirmDeleteScan = (record: ScanRecord) =>
    Alert.alert(t('history.deleteConfirmTitle'), t('history.deleteConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('history.delete'), style: 'destructive', onPress: () => removeScan(record.id) },
    ]);

  const confirmDeleteMeal = (record: MealRecord) =>
    Alert.alert(t('history.deleteConfirmTitle'), t('history.deleteConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('history.delete'), style: 'destructive', onPress: () => removeMeal(record.id) },
    ]);

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="px-4 pt-2 pb-3 gap-3">
          <View className="flex-row items-center gap-3">
            <PressableScale
              haptic="selection"
              accessibilityLabel={t('common.back')}
              onPress={() => router.back()}>
              <ArrowLeft size={24} color={colors.text} />
            </PressableScale>
            <View className="flex-1">
              <Text className="font-body text-sm text-ink-muted dark:text-ink-dark-muted">
                {t('history.kicker')}
              </Text>
              <Text className="font-heading text-2xl text-ink dark:text-ink-dark">
                {t('history.title')}
              </Text>
            </View>
            {!isEmpty && (
              <PressableScale
                haptic="light"
                onPress={confirmClear}
                accessibilityLabel={t('history.clearAll')}
                style={{ width: 40, height: 40 }}>
                <View className="w-10 h-10 rounded-xl items-center justify-center bg-surface dark:bg-surface-raised-dark">
                  <Trash2 size={18} color={stateColors.risk} />
                </View>
              </PressableScale>
            )}
          </View>

          <SegmentControl segments={HISTORY_TABS} value={tab} onChange={setTab} />

          {!isEmpty && (
            <>
              <View className="flex-row items-center gap-2 h-11 rounded-pill px-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark">
                <Search size={18} color={colors.textMuted} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={t(isMeal ? 'history.searchMealPlaceholder' : 'history.searchPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  className="flex-1 font-body text-[15px] text-ink dark:text-ink-dark"
                  returnKeyType="search"
                />
              </View>

              {!isMeal && (
                <View className="flex-row gap-2">
                  <FilterChip tone="all" label={t('common.all')} active={filter === 'all'} onPress={() => setFilter('all')} />
                  <FilterChip tone="safe" label={t('history.filterSafe')} active={filter === 'safe'} onPress={() => setFilter('safe')} />
                  <FilterChip tone="alerts" label={t('history.filterAlerts')} active={filter === 'alerts'} onPress={() => setFilter('alerts')} />
                </View>
              )}
            </>
          )}
        </View>

        {isEmpty ? (
          <HistoryEmpty isMeal={isMeal} />
        ) : isMeal ? (
          <SectionList
            sections={mealSections}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            ListEmptyComponent={
              <Text className="text-center font-body-medium text-sm text-ink-muted dark:text-ink-dark-muted mt-10">
                {t('history.noResults')}
              </Text>
            }
            renderSectionHeader={({ section }) => <SectionHeader section={section} />}
            renderItem={({ item }) => (
              <View className="mb-3">
                <MealRow
                  record={item}
                  onPress={() => router.push({ pathname: '/meal-result', params: { id: item.id } })}
                  onLongPress={() => confirmDeleteMeal(item)}
                />
              </View>
            )}
          />
        ) : (
          <SectionList
            sections={scanSections}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            ListEmptyComponent={
              <Text className="text-center font-body-medium text-sm text-ink-muted dark:text-ink-dark-muted mt-10">
                {t('history.noResults')}
              </Text>
            }
            renderSectionHeader={({ section }) => <SectionHeader section={section} />}
            renderItem={({ item }) => (
              <View className="mb-3">
                <HistoryRow
                  record={item}
                  onPress={() => router.push({ pathname: '/result', params: { id: item.id } })}
                  onLongPress={() => confirmDeleteScan(item)}
                />
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

function SectionHeader({ section }: { section: { title: string; count: number } }) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between pt-4 pb-2">
      <Text className="font-heading-medium text-xs tracking-wider text-ink-muted dark:text-ink-dark-muted">
        {section.title.toLocaleUpperCase('tr')}
      </Text>
      <Text className="font-body text-xs text-ink-muted dark:text-ink-dark-muted">
        {t('history.count', { count: section.count })}
      </Text>
    </View>
  );
}

function HistoryEmpty({ isMeal }: { isMeal: boolean }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  return (
    <View className="flex-1 items-center justify-center px-8 gap-3">
      <View className="w-[88px] h-[88px] rounded-full items-center justify-center bg-brand-tint dark:bg-brand-dark-tint mb-2">
        {isMeal ? <Flame size={40} color={colors.brand} /> : <History size={40} color={colors.brand} />}
      </View>
      <Text className="font-heading text-[22px] leading-7 text-center text-ink dark:text-ink-dark">
        {t(isMeal ? 'history.emptyMealTitle' : 'placeholders.historyTitle')}
      </Text>
      <Text className="font-body text-sm leading-5 text-center text-ink-muted dark:text-ink-dark-muted max-w-[260px]">
        {t(isMeal ? 'history.emptyMealSubtitle' : 'placeholders.historySubtitle')}
      </Text>
    </View>
  );
}

const CHIP: Record<
  Filter,
  { active: string; activeText: string; inactive: string; inactiveText: string }
> = {
  all: {
    active: 'bg-ink dark:bg-lime',
    activeText: 'text-cream dark:text-[#0C0F0C]',
    inactive: 'bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark',
    inactiveText: 'text-ink-muted dark:text-ink-dark-muted',
  },
  safe: {
    active: 'bg-safe',
    activeText: 'text-white',
    inactive: 'bg-safe/12 border border-safe/30',
    inactiveText: 'text-safe',
  },
  alerts: {
    active: 'bg-warning',
    activeText: 'text-[#0C0F0C]',
    inactive: 'bg-warning/12 border border-warning/30',
    inactiveText: 'text-warning',
  },
};

function FilterChip({
  tone,
  label,
  active,
  onPress,
}: {
  tone: Filter;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const c = CHIP[tone];
  return (
    <PressableScale haptic="selection" onPress={onPress} accessibilityLabel={label}>
      <View className={`rounded-pill px-4 py-1.5 ${active ? c.active : c.inactive}`}>
        <Text className={`font-body-medium text-[13px] ${active ? c.activeText : c.inactiveText}`}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

function HistoryRow({
  record,
  onPress,
  onLongPress,
}: {
  record: ScanRecord;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { grade, color } = getScore(record.healthScore);
  const name = record.productName ?? t('common.unknownProduct');
  const alertCount = record.personalAlerts.length;

  const d = new Date(record.createdAt);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  return (
    <PressableScale
      haptic="light"
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityLabel={`${name}, ${grade} ${record.healthScore}`}>
      <Card className="flex-row items-center gap-3 p-3" elevation="none">
        <View className="w-12 h-12 rounded-xl items-center justify-center bg-cream dark:bg-surface-raised-dark">
          <UtensilsCrossed size={22} color={colors.textMuted} />
        </View>

        <View className="flex-1 gap-0.5">
          <Text numberOfLines={1} className="font-heading text-[15px] text-ink dark:text-ink-dark">
            {name}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Text className="font-body text-xs text-ink-muted dark:text-ink-dark-muted tabular-nums">
              {time}
            </Text>
            <Text className="font-body text-xs text-ink-muted dark:text-ink-dark-muted">·</Text>
            <Text className="font-body text-xs text-ink-muted dark:text-ink-dark-muted">
              {t('history.ingredientCount', { count: record.ingredients.length })}
            </Text>
            {alertCount > 0 && (
              <>
                <Text className="font-body text-xs text-ink-muted dark:text-ink-dark-muted">·</Text>
                <Text className="font-body-medium text-xs" style={{ color: stateColors.risk }}>
                  {t('history.alerts', { count: alertCount })}
                </Text>
              </>
            )}
          </View>
        </View>

        <View className="rounded-pill px-2.5 py-1" style={{ backgroundColor: color }}>
          <Text
            className="font-body-bold text-[13px] tabular-nums"
            style={{ color: readableText(color) }}>
            {grade} · {record.healthScore}
          </Text>
        </View>
      </Card>
    </PressableScale>
  );
}

function MealRow({
  record,
  onPress,
  onLongPress,
}: {
  record: MealRecord;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { t } = useTranslation();
  const name = record.mealName ?? t('meal.untitled');

  const d = new Date(record.createdAt);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  return (
    <PressableScale
      haptic="light"
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityLabel={`${name}, ${record.mealScore}`}>
      <Card className="flex-row items-center gap-3 p-3" elevation="none">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${accentMeal}22` }}>
          <Flame size={22} color={accentMeal} />
        </View>

        <View className="flex-1 gap-0.5">
          <Text numberOfLines={1} className="font-heading text-[15px] text-ink dark:text-ink-dark">
            {name}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Text className="font-body text-xs text-ink-muted dark:text-ink-dark-muted tabular-nums">
              {time}
            </Text>
            <Text className="font-body text-xs text-ink-muted dark:text-ink-dark-muted">·</Text>
            <Text className="font-body text-xs text-ink-muted dark:text-ink-dark-muted tabular-nums">
              {t('meal.kcal', { count: record.estCalories })}
            </Text>
          </View>
        </View>

        <View className="rounded-pill px-2.5 py-1" style={{ backgroundColor: accentMeal }}>
          <Text className="font-body-bold text-[13px] tabular-nums" style={{ color: '#FFFFFF' }}>
            {record.mealScore}
          </Text>
        </View>
      </Card>
    </PressableScale>
  );
}
