import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Flame,
  Lightbulb,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { PressableScale } from '@/components/ui/pressable-scale';
import {
  getDictionaryEntry,
  pickText,
  type DictionaryEntry,
} from '@/data/dictionary';
import type { RiskLevel } from '@/services/analysis/types';
import { useSaved } from '@/store/saved';
import { accentLime, onAccentLime, stateColors, useThemeColors } from '@/theme';

const TODAY_TIP_ID = 'e621';
const EARLIER_TIP_IDS = ['e330', 'e951', 'e322'];

const NOTE: Record<RiskLevel, { key: string; color: string }> = {
  safe: { key: 'dailyTip.noteSafe', color: stateColors.safe },
  caution: { key: 'dailyTip.noteCaution', color: stateColors.caution },
  risk: { key: 'dailyTip.noteRisk', color: stateColors.risk },
};

const WEEKDAYS: Record<string, string[]> = {
  tr: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
const MONTHS: Record<string, string[]> = {
  tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getFullYear(), 0, 0);
  const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((now - start) / 86_400_000);
}

export default function DailyTipScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const saved = useSaved((s) => s.ids);
  const toggleSaved = useSaved((s) => s.toggle);

  const lang = i18n.language.startsWith('en') ? 'en' : 'tr';
  const today = useMemo(() => getDictionaryEntry(TODAY_TIP_ID), []);
  const earlier = useMemo(
    () =>
      EARLIER_TIP_IDS.map((id) => getDictionaryEntry(id)).filter(
        (e): e is DictionaryEntry => !!e,
      ),
    [],
  );

  const now = new Date();
  const dateStr = `${WEEKDAYS[lang][now.getDay()]} · ${now.getDate()} ${MONTHS[lang][now.getMonth()]}`;

  const openIngredient = (id: string) =>
    router.push({ pathname: '/ingredient', params: { id } });

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 px-4">
        <View className="flex-row items-center justify-between pt-2 pb-1">
          <HeaderButton
            Icon={ArrowLeft}
            onPress={() => router.back()}
            label={t('common.back')}
          />
          <Text className="font-heading text-base text-ink dark:text-ink-dark">
            {t('dailyTip.title')}
          </Text>
          {today ? (
            <PressableScale
              haptic="light"
              onPress={() => toggleSaved(today.id)}
              accessibilityLabel={t('saved.save')}
              style={{ width: 40, height: 40 }}>
              <View className="w-10 h-10 rounded-xl items-center justify-center bg-surface dark:bg-surface-raised-dark">
                {saved.includes(today.id) ? (
                  <BookmarkCheck size={18} color={accentLime} />
                ) : (
                  <Bookmark size={18} color={colors.text} />
                )}
              </View>
            </PressableScale>
          ) : (
            <View style={{ width: 40, height: 40 }} />
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pt-3 pb-8 gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-body text-sm text-ink-muted dark:text-ink-dark-muted">
              {dateStr}
            </Text>
            <View
              className="flex-row items-center gap-1 rounded-pill px-3 py-1"
              style={{ backgroundColor: accentLime }}>
              <Text className="font-body-bold text-xs" style={{ color: onAccentLime }}>
                {t('dailyTip.badge', { n: dayOfYear(now) })}
              </Text>
              <Flame size={12} color={onAccentLime} />
            </View>
          </View>

          {today && <TodayTipCard entry={today} onReadMore={() => openIngredient(today.id)} />}

          <View className="gap-3 mt-1">
            <View className="flex-row items-center justify-between">
              <Text className="font-heading text-lg text-ink dark:text-ink-dark">
                {t('dailyTip.earlier')}
              </Text>
              <PressableScale haptic="selection" onPress={() => router.push('/dictionary')}>
                <Text className="font-body-medium text-sm text-ink-muted dark:text-ink-dark-muted">
                  {t('common.all')} →
                </Text>
              </PressableScale>
            </View>
            <View className="gap-3">
              {earlier.map((e) => (
                <EarlierRow key={e.id} entry={e} onPress={() => openIngredient(e.id)} />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function HeaderButton({
  Icon,
  onPress,
  label,
}: {
  Icon: typeof ArrowLeft;
  onPress: () => void;
  label: string;
}) {
  const colors = useThemeColors();
  return (
    <PressableScale
      haptic="light"
      onPress={onPress}
      accessibilityLabel={label}
      style={{ width: 40, height: 40 }}>
      <View className="w-10 h-10 rounded-xl items-center justify-center bg-surface dark:bg-surface-raised-dark">
        <Icon size={18} color={colors.text} />
      </View>
    </PressableScale>
  );
}

function TodayTipCard({
  entry,
  onReadMore,
}: {
  entry: DictionaryEntry;
  onReadMore: () => void;
}) {
  const { t, i18n } = useTranslation();
  const note = NOTE[entry.risk];
  const name = pickText(entry.name, i18n.language).replace(/\s*\(.*\)\s*$/, '');

  return (
    <View className="overflow-hidden rounded-3xl p-5 bg-[#101410] dark:bg-surface-dark dark:border dark:border-border-dark">
      <View
        pointerEvents="none"
        className="absolute -right-7 -top-7 w-36 h-36 rounded-full"
        style={{ backgroundColor: accentLime, opacity: 0.07 }}
      />

      <View className="flex-row items-center gap-2.5 mb-4">
        <View
          className="w-8 h-8 rounded-xl items-center justify-center"
          style={{ backgroundColor: accentLime }}>
          <Lightbulb size={18} color={onAccentLime} />
        </View>
        <Text
          className="font-heading-medium text-xs"
          style={{ color: accentLime, letterSpacing: 2 }}>
          {t('dailyTip.todaysTip')}
        </Text>
      </View>

      <View className="self-start rounded-md px-2 py-1 mb-3 bg-white/10">
        <Text className="font-body-bold text-[11px] text-white/70">{entry.code}</Text>
      </View>

      <Text className="font-display text-2xl leading-8 text-white mb-3">
        {t('dailyTip.question', { name })}
      </Text>

      <Text className="font-body text-sm leading-[21px] text-white/70">
        {pickText(entry.what, i18n.language)}
      </Text>

      <View className="h-px bg-white/10 my-4" />

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: note.color }} />
          <Text className="font-body-medium text-xs" style={{ color: note.color }}>
            {t(note.key)}
          </Text>
        </View>
        <PressableScale
          haptic="light"
          onPress={onReadMore}
          accessibilityLabel={t('dailyTip.readMore')}>
          <View className="flex-row items-center gap-1">
            <Text className="font-body-bold text-[13px]" style={{ color: accentLime }}>
              {t('dailyTip.readMore')}
            </Text>
            <ArrowRight size={14} color={accentLime} />
          </View>
        </PressableScale>
      </View>
    </View>
  );
}

function EarlierRow({
  entry,
  onPress,
}: {
  entry: DictionaryEntry;
  onPress: () => void;
}) {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const note = NOTE[entry.risk];

  return (
    <PressableScale
      haptic="light"
      onPress={onPress}
      accessibilityLabel={pickText(entry.name, i18n.language)}>
      <Card className="flex-row items-center gap-3 p-3" elevation="none">
        <View className="w-11 h-11 rounded-xl items-center justify-center bg-cream dark:bg-surface-raised-dark">
          <Text className="font-body-bold text-[11px] text-ink dark:text-ink-dark">
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
            numberOfLines={1}
            className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted mt-0.5">
            {t(`dictionary.cat.${entry.category}`)} · {t(note.key)}
          </Text>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </Card>
    </PressableScale>
  );
}
