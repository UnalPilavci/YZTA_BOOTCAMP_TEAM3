import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Target,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Reveal } from '@/components/ui/reveal';
import { DIARY_SLOTS, type DiarySlot, type SlotMeta } from '@/data/diary-slots';
import { dateKeyOf, entryTotals, useDiary, type DiaryEntry } from '@/store/diary';
import { useDailyTargets, useProfile } from '@/store/profile';
import { accentLime, accentMeal, useThemeColors } from '@/theme';

const MONTHS_SHORT: Record<string, string[]> = {
  tr: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const MONTHS_FULL: Record<string, string[]> = {
  tr: [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

const WEEKDAYS: Record<string, string[]> = {
  tr: ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
};

function shiftDay(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dateKeyOf(new Date(y, m - 1, d + delta).getTime());
}

type DayTotals = { kcal: number; protein: number; carbs: number; fat: number };

export default function DiaryScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const lang = i18n.language.startsWith('en') ? 'en' : 'tr';

  const entries = useDiary((s) => s.entries);
  const targets = useDailyTargets();
  const goalSet = useProfile((s) => s.goal != null);

  const todayKey = dateKeyOf(Date.now());
  const yesterdayKey = dateKeyOf(Date.now() - 86_400_000);

  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [pickerOpen, setPickerOpen] = useState(false);

  const entryDays = useMemo(() => new Set(entries.map((e) => e.loggedOn)), [entries]);

  const { bySlot, totals } = useMemo(() => {
    const grouped = new Map<DiarySlot, DiaryEntry[]>();
    const sum: DayTotals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    for (const e of entries) {
      if (e.loggedOn !== selectedKey) continue;
      const list = grouped.get(e.slot) ?? [];
      list.push(e);
      grouped.set(e.slot, list);
      const tot = entryTotals(e);
      sum.kcal += tot.kcal;
      sum.protein += tot.protein;
      sum.carbs += tot.carbs;
      sum.fat += tot.fat;
    }
    for (const list of grouped.values()) list.sort((a, b) => a.createdAt - b.createdAt);
    return { bySlot: grouped, totals: sum };
  }, [entries, selectedKey]);

  const barLabel = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    const dm = `${d} ${MONTHS_SHORT[lang][m - 1]}`;
    if (key === todayKey) return `${t('diary.today')} · ${dm}`;
    if (key === yesterdayKey) return `${t('diary.yesterday')} · ${dm}`;
    return `${dm} ${y}`;
  };

  const canGoNext = selectedKey < todayKey;

  const openAdd = (slot: DiarySlot) =>
    router.push({ pathname: '/diary-add', params: { date: selectedKey, slot } });
  const openEdit = (id: string) => router.push({ pathname: '/diary-add', params: { id } });

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-1">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}>
            <View className="w-10 h-10 rounded-xl items-center justify-center bg-surface dark:bg-surface-raised-dark">
              <ArrowLeft size={18} color={colors.text} />
            </View>
          </PressableScale>
          <Text className="font-heading text-[17px] text-ink dark:text-ink-dark">
            {t('diary.title')}
          </Text>
        </View>

        <View className="flex-row items-center gap-2 px-4 pt-1 pb-3">
          <StepButton
            Icon={ChevronLeft}
            onPress={() => setSelectedKey((k) => shiftDay(k, -1))}
            accessibilityLabel={t('diary.prevDay')}
          />
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('diary.selectDate')}
            onPress={() => setPickerOpen(true)}
            style={{ flex: 1 }}>
            <View className="flex-row items-center justify-center gap-2 h-10 rounded-xl bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
              <CalendarDays size={16} color={accentLime} />
              <Text className="font-heading text-[14px] text-ink dark:text-ink-dark">
                {barLabel(selectedKey)}
              </Text>
            </View>
          </PressableScale>
          <StepButton
            Icon={ChevronRight}
            onPress={() => canGoNext && setSelectedKey((k) => shiftDay(k, 1))}
            disabled={!canGoNext}
            accessibilityLabel={t('diary.nextDay')}
          />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="px-4 pb-10 gap-4">
          {targets ? (
            <Reveal index={0}>
              <View className="rounded-2xl p-4 gap-3.5 bg-[#101410] dark:bg-surface-dark dark:border dark:border-border-dark">
                <View className="flex-row items-end justify-between">
                  <View>
                    <Text className="font-body text-[12px] text-white/60">{t('diary.consumed')}</Text>
                    <View className="flex-row items-end gap-1.5">
                      <Text className="font-display text-[26px] leading-7" style={{ color: accentLime }}>
                        {totals.kcal.toLocaleString()}
                      </Text>
                      <Text className="font-body text-[13px] text-white/60 mb-1">
                        / {targets.kcal.toLocaleString()} {t('targets.kcal')}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-body text-[12px] text-white/60">{t('diary.remaining')}</Text>
                    <Text className="font-heading text-[18px] text-white tabular-nums">
                      {Math.max(0, targets.kcal - totals.kcal).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <ProgressBar value={totals.kcal} max={targets.kcal} color={accentLime} />
                <View className="flex-row gap-2.5 pt-0.5">
                  <MacroProgress label={t('targets.protein')} value={totals.protein} max={targets.protein} />
                  <MacroProgress label={t('targets.carbs')} value={totals.carbs} max={targets.carbs} />
                  <MacroProgress label={t('targets.fat')} value={totals.fat} max={targets.fat} />
                </View>
              </View>
            </Reveal>
          ) : (
            <Reveal index={0}>
              <PressableScale
                haptic="light"
                accessibilityLabel={t('targets.setGoalCta')}
                onPress={() => router.push('/edit-goal')}>
                <View className="flex-row items-center gap-3 rounded-2xl p-4 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                  <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${accentLime}22` }}>
                    <Target size={20} color={accentLime} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-heading text-[15px] text-ink dark:text-ink-dark">
                      {goalSet ? t('diary.completeGoalTitle') : t('targets.setGoalTitle')}
                    </Text>
                    <Text className="font-body text-[12.5px] text-ink-muted dark:text-ink-dark-muted">
                      {t('targets.setGoalSubtitle')}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>
              </PressableScale>
            </Reveal>
          )}

          {DIARY_SLOTS.map((meta, i) => (
            <Reveal key={meta.id} index={Math.min(i + 1, 6)}>
              <SlotSection
                meta={meta}
                entries={bySlot.get(meta.id) ?? []}
                onAdd={() => openAdd(meta.id)}
                onEdit={openEdit}
              />
            </Reveal>
          ))}
        </ScrollView>

        <CalendarSheet
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          selectedKey={selectedKey}
          todayKey={todayKey}
          entryDays={entryDays}
          lang={lang}
          onSelect={setSelectedKey}
        />
      </SafeAreaView>
    </View>
  );
}

function StepButton({
  Icon,
  onPress,
  disabled,
  accessibilityLabel,
}: {
  Icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
}) {
  const colors = useThemeColors();
  return (
    <PressableScale
      haptic="selection"
      accessibilityLabel={accessibilityLabel}
      onPress={disabled ? () => {} : onPress}
      style={disabled ? { opacity: 0.35 } : undefined}>
      <View className="w-10 h-10 rounded-xl items-center justify-center bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
        <Icon size={18} color={colors.text} />
      </View>
    </PressableScale>
  );
}

function CalendarSheet({
  open,
  onClose,
  selectedKey,
  todayKey,
  entryDays,
  lang,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selectedKey: string;
  todayKey: string;
  entryDays: Set<string>;
  lang: 'tr' | 'en';
  onSelect: (key: string) => void;
}) {
  const { t } = useTranslation();
  const [view, setView] = useState(() => {
    const [y, m] = selectedKey.split('-').map(Number);
    return { y, m: m - 1 };
  });

  useEffect(() => {
    if (open) {
      const [y, m] = selectedKey.split('-').map(Number);
      setView({ y, m: m - 1 });
    }
  }, [open, selectedKey]);

  const [ty, tm] = todayKey.split('-').map(Number);
  const atCurrentMonth = view.y === ty && view.m === tm - 1;

  const pad = (n: number) => String(n).padStart(2, '0');
  const startWeekday = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${view.y}-${pad(view.m + 1)}-${pad(d)}`);

  const shiftMonth = (delta: number) => {
    if (delta > 0 && atCurrentMonth) return;
    setView((v) => {
      const total = v.y * 12 + v.m + delta;
      return { y: Math.floor(total / 12), m: ((total % 12) + 12) % 12 };
    });
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 items-center justify-center px-6" onPress={onClose}>
        <Pressable onPress={() => {}} className="w-full">
          <View className="rounded-3xl bg-cream dark:bg-surface-dark border border-border dark:border-border-dark p-4 gap-3">
            <View className="flex-row items-center justify-between">
              <StepButton
                Icon={ChevronLeft}
                onPress={() => shiftMonth(-1)}
                accessibilityLabel={t('diary.prevMonth')}
              />
              <Text className="font-heading text-[16px] text-ink dark:text-ink-dark">
                {MONTHS_FULL[lang][view.m]} {view.y}
              </Text>
              <StepButton
                Icon={ChevronRight}
                onPress={() => shiftMonth(1)}
                disabled={atCurrentMonth}
                accessibilityLabel={t('diary.nextMonth')}
              />
            </View>

            <View className="flex-row">
              {WEEKDAYS[lang].map((w) => (
                <View key={w} className="items-center" style={{ width: `${100 / 7}%` }}>
                  <Text className="font-body-medium text-[11px] text-ink-muted dark:text-ink-dark-muted">
                    {w}
                  </Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {cells.map((key, i) => {
                if (!key) return <View key={`b${i}`} style={{ width: `${100 / 7}%`, height: 46 }} />;
                const day = Number(key.slice(8));
                const isSel = key === selectedKey;
                const isToday = key === todayKey;
                const isFuture = key > todayKey;
                const hasData = entryDays.has(key);
                return (
                  <View
                    key={key}
                    className="items-center justify-center"
                    style={{ width: `${100 / 7}%`, height: 46 }}>
                    <Pressable
                      disabled={isFuture}
                      accessibilityLabel={key}
                      onPress={() => {
                        onSelect(key);
                        onClose();
                      }}>
                      <View className="items-center" style={{ width: 40 }}>
                        <View
                          className={`w-9 h-9 rounded-full items-center justify-center ${
                            !isSel && isToday ? 'border border-lime' : ''
                          }`}
                          style={isSel ? { backgroundColor: accentLime } : undefined}>
                          <Text
                            className="font-body-medium text-[14px] tabular-nums text-ink dark:text-ink-dark"
                            style={{
                              color: isSel ? '#0C0F0C' : undefined,
                              opacity: isFuture ? 0.3 : 1,
                            }}>
                            {day}
                          </Text>
                        </View>
                        <View className="h-1.5 mt-0.5 justify-center">
                          {hasData && !isSel && (
                            <View
                              className="w-1 h-1 rounded-full"
                              style={{ backgroundColor: accentLime }}
                            />
                          )}
                        </View>
                      </View>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SlotSection({
  meta,
  entries,
  onAdd,
  onEdit,
}: {
  meta: SlotMeta;
  entries: DiaryEntry[];
  onAdd: () => void;
  onEdit: (id: string) => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const Icon = meta.Icon;
  const slotKcal = entries.reduce((sum, e) => sum + entryTotals(e).kcal, 0);

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <View className="w-7 h-7 rounded-lg items-center justify-center" style={{ backgroundColor: `${accentMeal}22` }}>
          <Icon size={15} color={accentMeal} />
        </View>
        <Text className="font-heading text-[15px] text-ink dark:text-ink-dark">{t(meta.labelKey)}</Text>
        {slotKcal > 0 && (
          <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted tabular-nums">
            · {t('discover.kcal', { count: slotKcal })}
          </Text>
        )}
        <View className="flex-1" />
        <PressableScale haptic="light" accessibilityLabel={t('diary.addCta')} onPress={onAdd}>
          <View className="w-7 h-7 rounded-full items-center justify-center" style={{ backgroundColor: accentLime }}>
            <Plus size={16} color="#0C0F0C" />
          </View>
        </PressableScale>
      </View>

      {entries.length === 0 ? (
        <Pressable onPress={onAdd}>
          <View className="rounded-xl px-3.5 py-3 border border-dashed border-border dark:border-border-dark">
            <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">
              {t('diary.slotEmpty')}
            </Text>
          </View>
        </Pressable>
      ) : (
        <View className="gap-2">
          {entries.map((e) => (
            <EntryRow key={e.id} entry={e} onPress={() => onEdit(e.id)} colors={colors} />
          ))}
        </View>
      )}
    </View>
  );
}

function EntryRow({
  entry,
  onPress,
  colors,
}: {
  entry: DiaryEntry;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const { t } = useTranslation();
  const tot = entryTotals(entry);
  const hasMacros = tot.protein > 0 || tot.carbs > 0 || tot.fat > 0;

  return (
    <PressableScale haptic="light" accessibilityLabel={entry.name} onPress={onPress}>
      <View className="flex-row items-center gap-3 rounded-2xl p-3.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text numberOfLines={1} className="font-heading text-[15px] text-ink dark:text-ink-dark flex-shrink">
              {entry.name || t('common.unknownProduct')}
            </Text>
            {entry.quantity !== 1 && (
              <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted tabular-nums">
                ×{entry.quantity % 1 === 0 ? entry.quantity : entry.quantity.toFixed(1)}
              </Text>
            )}
          </View>
          {hasMacros && (
            <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted mt-0.5 tabular-nums">
              {t('targets.protein')} {tot.protein} · {t('targets.carbs')} {tot.carbs} · {t('targets.fat')} {tot.fat} g
            </Text>
          )}
        </View>
        <View className="items-end">
          <Text className="font-heading text-[15px] text-ink dark:text-ink-dark tabular-nums">
            {tot.kcal.toLocaleString()}
          </Text>
          <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted">
            {t('targets.kcal')}
          </Text>
        </View>
        <ChevronRight size={16} color={colors.textMuted} />
      </View>
    </PressableScale>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const over = value > max;
  return (
    <View className="h-2.5 rounded-full overflow-hidden bg-white/10">
      <View
        className="h-full rounded-full"
        style={{ width: `${pct}%`, backgroundColor: over ? '#F2A73B' : color }}
      />
    </View>
  );
}

function MacroProgress({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const over = value > max;
  return (
    <View className="flex-1 gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text className="font-body text-[11px] text-white/60">{label}</Text>
        <Text className="font-body-medium text-[11px] text-white/80 tabular-nums">
          {value}/{max}g
        </Text>
      </View>
      <View className="h-1.5 rounded-full overflow-hidden bg-white/10">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: over ? '#F2A73B' : accentMeal }}
        />
      </View>
    </View>
  );
}
