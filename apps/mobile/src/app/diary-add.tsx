import { useLocalSearchParams, useRouter } from 'expo-router';
import { Minus, Plus, Trash2, UtensilsCrossed } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { DIARY_SLOTS, defaultSlotForNow, type DiarySlot } from '@/data/diary-slots';
import { dateKeyOf, useDiary } from '@/store/diary';
import { useMeals } from '@/store/meals';
import { accentLime, accentMeal, onAccentLime, useResolvedScheme, useThemeColors } from '@/theme';

function formatQty(q: number): string {
  return Number.isInteger(q) ? String(q) : q.toFixed(1);
}

function toNum(v: string): number {
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function DiaryAddScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const scheme = useResolvedScheme();
  const activeIconColor = scheme === 'dark' ? onAccentLime : '#FFFFFF';
  const params = useLocalSearchParams<{ date?: string; slot?: string; id?: string }>();

  const editId = params.id;
  const existing = useDiary((s) => (editId ? s.entries.find((e) => e.id === editId) : undefined));
  const isEdit = !!existing;

  const dateKey = existing?.loggedOn ?? params.date ?? dateKeyOf(Date.now());
  const meals = useMeals((s) => s.meals);
  const recentMeals = useMemo(() => meals.slice(0, 12), [meals]);

  const initialSlot = (existing?.slot ?? (params.slot as DiarySlot) ?? defaultSlotForNow()) as DiarySlot;
  const [slot, setSlot] = useState<DiarySlot>(initialSlot);
  const [name, setName] = useState(existing?.name ?? '');
  const [kcal, setKcal] = useState(existing ? String(existing.kcal) : '');
  const [protein, setProtein] = useState(existing?.protein ? String(existing.protein) : '');
  const [carbs, setCarbs] = useState(existing?.carbs ? String(existing.carbs) : '');
  const [fat, setFat] = useState(existing?.fat ? String(existing.fat) : '');
  const [quantity, setQuantity] = useState(existing?.quantity ?? 1);
  const [source, setSource] = useState<'manual' | 'meal'>(existing?.source ?? 'manual');
  const [sourceId, setSourceId] = useState<string | undefined>(existing?.sourceId);

  const baseKcal = toNum(kcal);
  const totalKcal = Math.round(baseKcal * quantity);
  const canSave = name.trim().length > 0 && baseKcal > 0;

  const pickMeal = (mealId: string) => {
    const m = meals.find((x) => x.id === mealId);
    if (!m) return;
    setName(m.mealName?.trim() || m.summary || '');
    setKcal(String(m.estCalories ?? 0));
    setProtein(m.macros ? String(m.macros.protein) : '');
    setCarbs(m.macros ? String(m.macros.carbs) : '');
    setFat(m.macros ? String(m.macros.fat) : '');
    setQuantity(1);
    setSource('meal');
    setSourceId(m.id);
  };

  const bump = (delta: number) => {
    setQuantity((q) => Math.min(20, Math.max(0.5, Math.round((q + delta) * 2) / 2)));
  };

  const onSave = () => {
    if (!canSave) return;
    const payload = {
      loggedOn: dateKey,
      slot,
      name: name.trim(),
      quantity,
      kcal: Math.round(baseKcal),
      protein: toNum(protein),
      carbs: toNum(carbs),
      fat: toNum(fat),
      source,
      sourceId,
    };
    if (isEdit && editId) useDiary.getState().update(editId, payload);
    else useDiary.getState().add(payload);
    router.back();
  };

  const onDelete = () => {
    if (!editId) return;
    Alert.alert(t('diary.deleteTitle'), t('diary.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          useDiary.getState().remove(editId);
          router.back();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-row items-center justify-between px-4 pt-2 pb-1">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.cancel')}
            onPress={() => router.back()}>
            <Text className="font-body-medium text-[15px] text-ink-muted dark:text-ink-dark-muted">
              {t('common.cancel')}
            </Text>
          </PressableScale>
          <Text className="font-heading text-[17px] tracking-tight text-ink dark:text-ink-dark">
            {isEdit ? t('diary.editEntry') : t('diary.addEntry')}
          </Text>
          {isEdit ? (
            <PressableScale haptic="light" accessibilityLabel={t('common.delete')} onPress={onDelete}>
              <Trash2 size={20} color="#F43F5E" />
            </PressableScale>
          ) : (
            <View className="w-[52px]" />
          )}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="px-4 pt-3 pb-8 gap-4">
            <View className="gap-2">
              <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                {t('diary.slotLabel')}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {DIARY_SLOTS.map((s) => {
                  const active = slot === s.id;
                  const Icon = s.Icon;
                  return (
                    <PressableScale
                      key={s.id}
                      haptic="selection"
                      accessibilityLabel={t(s.labelKey)}
                      onPress={() => setSlot(s.id)}>
                      <View
                        className={`flex-row items-center gap-1.5 rounded-pill px-3.5 h-9 ${
                          active
                            ? 'bg-ink dark:bg-lime'
                            : 'bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark'
                        }`}>
                        <Icon size={15} color={active ? activeIconColor : colors.textMuted} />
                        <Text
                          className={`font-body-medium text-[13px] ${
                            active ? 'text-cream dark:text-[#0C0F0C]' : 'text-ink-muted dark:text-ink-dark-muted'
                          }`}>
                          {t(s.labelKey)}
                        </Text>
                      </View>
                    </PressableScale>
                  );
                })}
              </View>
            </View>

            {recentMeals.length > 0 && (
              <View className="gap-2">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('diary.fromMyMeals')}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerClassName="gap-2 pr-2">
                  {recentMeals.map((m) => (
                    <PressableScale
                      key={m.id}
                      haptic="light"
                      accessibilityLabel={m.mealName ?? m.summary}
                      onPress={() => pickMeal(m.id)}>
                      <View
                        className={`w-[130px] gap-1 rounded-2xl p-3 border ${
                          sourceId === m.id
                            ? 'border-lime bg-lime/10'
                            : 'bg-surface dark:bg-surface-raised-dark border-border dark:border-border-dark'
                        }`}>
                        <View className="flex-row items-center gap-1.5">
                          <UtensilsCrossed size={14} color={accentMeal} />
                          <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted tabular-nums">
                            {t('discover.kcal', { count: m.estCalories ?? 0 })}
                          </Text>
                        </View>
                        <Text numberOfLines={2} className="font-heading text-[13px] leading-[17px] text-ink dark:text-ink-dark">
                          {m.mealName?.trim() || m.summary || t('common.unknownProduct')}
                        </Text>
                      </View>
                    </PressableScale>
                  ))}
                </ScrollView>
              </View>
            )}

            <View className="gap-2">
              <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                {t('diary.nameLabel')}
              </Text>
              <View className="rounded-xl px-3.5 py-3 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                <TextInput
                  value={name}
                  onChangeText={(v) => {
                    setName(v);
                    if (source === 'meal') {
                      setSource('manual');
                      setSourceId(undefined);
                    }
                  }}
                  placeholder={t('diary.namePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  maxLength={80}
                  className="font-body text-[15px] text-ink dark:text-ink-dark"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('diary.kcalLabel')}
                </Text>
                <View className="rounded-xl px-3.5 py-3 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                  <TextInput
                    value={kcal}
                    onChangeText={setKcal}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    maxLength={5}
                    className="font-body text-[15px] text-ink dark:text-ink-dark"
                  />
                </View>
              </View>
              <View className="gap-2">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('diary.portionLabel')}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Stepper Icon={Minus} onPress={() => bump(-0.5)} color={colors.text} />
                  <Text className="w-9 text-center font-heading text-[16px] text-ink dark:text-ink-dark tabular-nums">
                    ×{formatQty(quantity)}
                  </Text>
                  <Stepper Icon={Plus} onPress={() => bump(0.5)} color={colors.text} />
                </View>
              </View>
            </View>

            <View className="gap-2">
              <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                {t('diary.macrosLabel')}
              </Text>
              <View className="flex-row gap-3">
                <MacroField label={t('targets.protein')} value={protein} onChange={setProtein} colors={colors} />
                <MacroField label={t('targets.carbs')} value={carbs} onChange={setCarbs} colors={colors} />
                <MacroField label={t('targets.fat')} value={fat} onChange={setFat} colors={colors} />
              </View>
            </View>

            <View className="flex-row items-center justify-between rounded-2xl p-4 bg-[#101410] dark:bg-surface-raised-dark">
              <Text className="font-body text-[13px] text-white/70">{t('diary.entryTotal')}</Text>
              <Text className="font-display text-[22px]" style={{ color: accentLime }}>
                {totalKcal.toLocaleString()} <Text className="font-body text-[13px] text-white/60">{t('targets.kcal')}</Text>
              </Text>
            </View>

            <PrimaryButton
              label={isEdit ? t('common.save') : t('diary.addCta')}
              icon={null}
              onPress={onSave}
              style={canSave ? undefined : { opacity: 0.4 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Stepper({ Icon, onPress, color }: { Icon: typeof Plus; onPress: () => void; color: string }) {
  return (
    <PressableScale haptic="light" accessibilityLabel="stepper" onPress={onPress}>
      <View className="w-10 h-11 rounded-xl items-center justify-center bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
        <Icon size={18} color={color} />
      </View>
    </PressableScale>
  );
}

function MacroField({
  label,
  value,
  onChange,
  colors,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View className="flex-1 gap-1.5">
      <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted text-center">{label}</Text>
      <View className="rounded-xl px-2 py-2.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          maxLength={4}
          className="font-body text-[15px] text-center text-ink dark:text-ink-dark"
        />
      </View>
    </View>
  );
}
