import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Dumbbell, Flame, TriangleAlert, Users } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Reveal } from '@/components/ui/reveal';
import { ScoreRing } from '@/components/ui/score-ring';
import { analyzeMeal } from '@/services/analysis/analyze';
import type { MealFood, MealResult } from '@/services/analysis/types';
import { VisionError } from '@/services/analysis/vision';
import { useMeals } from '@/store/meals';
import { accentMeal, useThemeColors } from '@/theme';

const QUALITY_COLOR: Record<MealFood['quality'], string> = {
  good: '#3FA34B',
  ok: '#E6B325',
  poor: '#DB4C40',
};

export default function MealResultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { uri, id } = useLocalSearchParams<{ uri?: string; id?: string }>();
  const readOnly = !!id;

  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [result, setResult] = useState<MealResult | null>(null);
  const [errorKey, setErrorKey] = useState('result.failed');
  const savedRef = useRef(false);
  const [savedId, setSavedId] = useState<string | null>(id ?? null);

  useEffect(() => {
    if (id) {
      const record = useMeals.getState().meals.find((m) => m.id === id);
      if (record) {
        setResult(record);
        setStatus('done');
      } else {
        setErrorKey('result.notFound');
        setStatus('error');
      }
      return;
    }

    let active = true;
    setStatus('loading');
    analyzeMeal(uri ?? '')
      .then((r) => {
        if (!active) return;
        setResult(r);
        setStatus('done');
        if (!savedRef.current) {
          savedRef.current = true;
          const record = useMeals.getState().add(r, uri);
          setSavedId(record.id);
        }
      })
      .catch((e: unknown) => {
        if (!active) return;
        setErrorKey(e instanceof VisionError ? e.messageKey : 'result.failed');
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [uri, id]);

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 px-4">
        <View className="flex-row items-center justify-between pt-2 pb-1">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}>
            <View className="w-10 h-10 rounded-full items-center justify-center bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
              <ArrowLeft size={20} color={colors.text} />
            </View>
          </PressableScale>
          <Text className="font-heading text-base text-ink dark:text-ink-dark">
            {t('meal.title')}
          </Text>
          <View className="w-10" />
        </View>

        {status === 'loading' && (
          <View className="flex-1 items-center justify-center gap-3">
            <ActivityIndicator color={accentMeal} />
            <Text className="font-body-medium text-[14px] text-ink-muted dark:text-ink-dark-muted">
              {t('meal.analyzing')}
            </Text>
          </View>
        )}

        {status === 'error' && (
          <View className="flex-1 items-center justify-center px-8 gap-3">
            <Text className="font-heading text-lg text-center text-ink dark:text-ink-dark">
              {t(errorKey)}
            </Text>
            <PrimaryButton
              label={readOnly ? t('common.close') : t('result.scanAgain')}
              icon={readOnly ? 'arrow-back-outline' : 'scan-outline'}
              onPress={() => (readOnly ? router.back() : router.replace('/scan'))}
            />
          </View>
        )}

        {status === 'done' && result && (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="pt-2 pb-8 gap-5">
              <Reveal index={0}>
                <View className="flex-row items-center gap-4 p-5 rounded-[28px] bg-[#101410] dark:bg-surface-dark dark:border dark:border-border-dark">
                  <ScoreRing
                    value={result.mealScore}
                    size={96}
                    showGrade={false}
                    ringColor={accentMeal}
                    textColor="#FFFFFF"
                  />
                  <View className="flex-1 gap-1">
                    <Text className="font-heading text-[17px] text-white" numberOfLines={2}>
                      {result.mealName || t('meal.untitled')}
                    </Text>
                    <View className="flex-row items-center gap-1.5 mt-0.5">
                      <Flame size={16} color={accentMeal} />
                      <Text className="font-display text-[22px] tabular-nums" style={{ color: accentMeal }}>
                        {t('meal.kcal', { count: result.estCalories })}
                      </Text>
                    </View>
                    <Text className="font-body text-[12.5px] text-white/70">
                      {result.summary}
                    </Text>
                  </View>
                </View>
              </Reveal>

              {result.macros && (
                <Reveal index={1}>
                  <MacroBar macros={result.macros} />
                </Reveal>
              )}

              <Reveal index={2}>
                <View className="gap-1">
                  <Text className="font-heading text-lg text-ink dark:text-ink-dark mb-1">
                    {t('meal.foodsTitle')}
                  </Text>
                  <View className="rounded-2xl overflow-hidden bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                    {result.foods.map((f, i) => (
                      <View
                        key={`${f.name}-${i}`}
                        className={`flex-row items-center gap-3 px-4 h-[52px] ${
                          i > 0 ? 'border-t border-border dark:border-border-dark' : ''
                        }`}>
                        <View
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: QUALITY_COLOR[f.quality] }}
                        />
                        <Text className="flex-1 font-body-medium text-[15px] text-ink dark:text-ink-dark" numberOfLines={1}>
                          {f.name}
                        </Text>
                        <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted tabular-nums">
                          {t('meal.kcal', { count: f.kcal })}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Reveal>

              {!!result.fitnessNote && (
                <Reveal index={3}>
                  <View className="flex-row gap-3 p-4 rounded-2xl bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center"
                      style={{ backgroundColor: `${accentMeal}22` }}>
                      <Dumbbell size={20} color={accentMeal} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-heading text-[14px] text-ink dark:text-ink-dark">
                        {t('meal.fitnessTitle')}
                      </Text>
                      <Text className="font-body text-[13px] leading-[19px] text-ink-muted dark:text-ink-dark-muted mt-0.5">
                        {result.fitnessNote}
                      </Text>
                    </View>
                  </View>
                </Reveal>
              )}

              {result.warnings.length > 0 && (
                <Reveal index={4}>
                  <View className="gap-2">
                    {result.warnings.map((w, i) => (
                      <View
                        key={i}
                        className="flex-row items-center gap-2.5 p-3.5 rounded-2xl bg-[#FDF3E0] dark:bg-[#2A2110]">
                        <TriangleAlert size={18} color="#E0A94A" />
                        <Text className="flex-1 font-body-medium text-[13px] text-[#8A5A12] dark:text-[#F5CE86]">
                          {w}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Reveal>
              )}

              <Reveal index={5}>
                <Text className="font-body text-xs leading-4 text-center text-ink-muted dark:text-ink-dark-muted">
                  {t('meal.disclaimer')}
                </Text>
              </Reveal>
            </ScrollView>

            <View className="gap-2" style={{ marginBottom: 12 }}>
              {savedId && (
                <ShareToCommunityButton
                  onPress={() =>
                    router.push({ pathname: '/share-post', params: { mealId: savedId } })
                  }
                />
              )}
              {readOnly ? (
                <PrimaryButton
                  label={t('common.close')}
                  icon="arrow-back-outline"
                  onPress={() => router.back()}
                />
              ) : (
                <>
                  <PrimaryButton
                    label={t('result.scanAgain')}
                    icon="scan-outline"
                    onPress={() => router.replace('/scan')}
                  />
                  <PressableScale
                    haptic="light"
                    accessibilityLabel={t('common.close')}
                    onPress={() => router.back()}>
                    <View className="h-[52px] rounded-xl items-center justify-center bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                      <Text className="font-heading text-[15px] text-ink dark:text-ink-dark">
                        {t('common.close')}
                      </Text>
                    </View>
                  </PressableScale>
                </>
              )}
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

function ShareToCommunityButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  return (
    <PressableScale haptic="light" onPress={onPress} accessibilityLabel={t('discover.shareToCommunity')}>
      <View className="flex-row items-center justify-center gap-2 h-[52px] rounded-xl bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
        <Users size={18} color={colors.text} />
        <Text className="font-heading text-[15px] text-ink dark:text-ink-dark">
          {t('discover.shareToCommunity')}
        </Text>
      </View>
    </PressableScale>
  );
}

function MacroBar({ macros }: { macros: { protein: number; carbs: number; fat: number } }) {
  const { t } = useTranslation();
  const total = Math.max(1, macros.protein + macros.carbs + macros.fat);
  const parts = [
    { key: 'protein', label: t('meal.protein'), value: macros.protein, color: '#4C86E8' },
    { key: 'carbs', label: t('meal.carbs'), value: macros.carbs, color: '#E6B325' },
    { key: 'fat', label: t('meal.fat'), value: macros.fat, color: '#E8724C' },
  ];
  return (
    <View className="gap-2.5 p-4 rounded-2xl bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
      <Text className="font-heading text-[14px] text-ink dark:text-ink-dark">
        {t('meal.macrosTitle')}
      </Text>
      <View className="flex-row h-2.5 rounded-full overflow-hidden">
        {parts.map((p) => (
          <View key={p.key} style={{ flex: p.value / total, backgroundColor: p.color }} />
        ))}
      </View>
      <View className="flex-row justify-between">
        {parts.map((p) => (
          <View key={p.key} className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted">
              {p.label} {t('meal.grams', { count: p.value })}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
