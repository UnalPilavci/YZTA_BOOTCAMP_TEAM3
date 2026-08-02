import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  CircleAlert,
  CircleCheck,
  Share2,
  TriangleAlert,
  Users,
  UtensilsCrossed,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Pill, type PillTone } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Reveal } from '@/components/ui/reveal';
import { ScoreRing } from '@/components/ui/score-ring';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeImage } from '@/services/analysis/analyze';
import type {
  AnalysisResult,
  IngredientAnalysis,
  PersonalAlert,
  RiskLevel,
} from '@/services/analysis/types';
import { VisionError } from '@/services/analysis/vision';
import { useProfile } from '@/store/profile';
import { useScans } from '@/store/scans';
import { accentLime, getScore, onAccentLime, useThemeColors } from '@/theme';

const RISK_META: Record<RiskLevel, { tone: PillTone; labelKey: string }> = {
  safe: { tone: 'safe', labelKey: 'result.riskSafe' },
  caution: { tone: 'warning', labelKey: 'result.riskCaution' },
  risk: { tone: 'danger', labelKey: 'result.riskRisk' },
};

const ALERT_STYLE = {
  caution: {
    Icon: CircleAlert,
    box: 'bg-[#FDF3E0] dark:bg-[#2A2110]',
    icon: '#E0A94A',
    title: 'text-[#8A5A12] dark:text-[#F5CE86]',
    sub: 'text-[#B08A4E] dark:text-[#B8965A]',
  },
  risk: {
    Icon: TriangleAlert,
    box: 'bg-[#FDECEA] dark:bg-[#2E1A17]',
    icon: '#E24C4C',
    title: 'text-[#8A2A1E] dark:text-[#F5B0A6]',
    sub: 'text-[#B0685E] dark:text-[#C58A80]',
  },
} as const;

export default function ResultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { uri, id } = useLocalSearchParams<{ uri?: string; id?: string }>();
  const readOnly = !!id;

  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorKey, setErrorKey] = useState('result.failed');
  const savedRef = useRef(false);
  const [savedId, setSavedId] = useState<string | null>(id ?? null);

  useEffect(() => {
    if (id) {
      const record = useScans.getState().scans.find((r) => r.id === id);
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
    const { allergens, sensitivities } = useProfile.getState();
    setStatus('loading');
    analyzeImage(uri ?? '', { allergens, sensitivities })
      .then((r) => {
        if (!active) return;
        setResult(r);
        setStatus('done');
        if (!savedRef.current) {
          savedRef.current = true;
          const record = useScans.getState().add(r, uri);
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

  const onShare = async () => {
    if (!result) return;
    const { grade } = getScore(result.healthScore);
    try {
      await Share.share({
        message: t('result.shareText', {
          name: result.productName ?? t('common.unknownProduct'),
          grade,
          score: result.healthScore,
        }),
      });
    } catch {
    }
  };

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
            {t('result.title')}
          </Text>
          <HeaderButton
            Icon={Share2}
            onPress={onShare}
            label={t('result.shareLabel')}
          />
        </View>

        {status === 'loading' && <ProcessingSkeleton />}
        {status === 'error' && (
          <ErrorView
            message={t(errorKey)}
            readOnly={readOnly}
            onRetry={() => (readOnly ? router.back() : router.replace('/scan'))}
          />
        )}
        {status === 'done' && result && (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="pt-2 pb-8 gap-5">
              <Reveal index={0}>
                <ScoreHero result={result} />
              </Reveal>

              <Reveal index={1}>
                {result.personalAlerts.length > 0 ? (
                  <PersonalAlerts alerts={result.personalAlerts} />
                ) : (
                  <NoAlerts />
                )}
              </Reveal>

              <Reveal index={2}>
                <View className="gap-1">
                  <Text className="font-heading text-lg text-ink dark:text-ink-dark mb-1">
                    {t('result.ingredientsTitle')}
                  </Text>
                  <View>
                    {result.ingredients.map((ing, i) => (
                      <IngredientRow
                        key={`${ing.name}-${i}`}
                        ingredient={ing}
                        last={i === result.ingredients.length - 1}
                        onPress={() =>
                          router.push({
                            pathname: '/ingredient',
                            params: {
                              name: ing.name,
                              code: ing.code ?? '',
                              note: ing.note,
                              risk: ing.risk,
                            },
                          })
                        }
                      />
                    ))}
                  </View>
                </View>
              </Reveal>

              <Reveal index={3}>
                <ScoreBreakdown result={result} />
              </Reveal>

              <Reveal index={4}>
                <Text className="font-body text-xs leading-4 text-center text-ink-muted dark:text-ink-dark-muted">
                  {t('result.disclaimer')}
                </Text>
              </Reveal>
            </ScrollView>
            <View className="gap-2" style={{ marginBottom: 12 }}>
              {savedId && <ConsumedButton scanId={savedId} />}
              {savedId && (
                <ShareToCommunityButton
                  onPress={() =>
                    router.push({ pathname: '/share-post', params: { scanId: savedId } })
                  }
                />
              )}
              <PrimaryButton
                label={readOnly ? t('common.close') : t('result.scanAgain')}
                icon={readOnly ? 'arrow-back-outline' : 'scan-outline'}
                onPress={() => (readOnly ? router.back() : router.replace('/scan'))}
              />
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

function ConsumedButton({ scanId }: { scanId: string }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const consumed = useScans((s) => s.scans.find((r) => r.id === scanId)?.consumed ?? false);

  return (
    <PressableScale
      haptic="medium"
      onPress={() => useScans.getState().toggleConsumed(scanId)}
      accessibilityLabel={consumed ? t('result.consumedActive') : t('result.markConsumed')}>
      <View
        className="flex-row items-center justify-center gap-2 h-[52px] rounded-xl"
        style={{ backgroundColor: consumed ? accentLime : colors.surface }}>
        {consumed ? (
          <Check size={18} color={onAccentLime} />
        ) : (
          <UtensilsCrossed size={18} color={colors.text} />
        )}
        <Text
          className="font-heading text-[15px]"
          style={{ color: consumed ? onAccentLime : colors.text }}>
          {t(consumed ? 'result.consumedActive' : 'result.markConsumed')}
        </Text>
      </View>
    </PressableScale>
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

function ProcessingSkeleton() {
  const { t } = useTranslation();
  const steps = [
    t('result.stepReading'),
    t('result.stepParsing'),
    t('result.stepScoring'),
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => Math.min(i + 1, steps.length - 1));
    }, 650);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <View className="flex-1 pt-6 gap-5">
      <View className="items-center gap-4 py-2">
        <Skeleton radius="round" height={130} width={130} />
        <Skeleton height={16} width={200} />
      </View>
      <Skeleton height={72} radius={20} />
      <View className="gap-3">
        <Skeleton height={18} width={150} />
        <Skeleton height={52} radius={16} />
        <Skeleton height={52} radius={16} />
        <Skeleton height={52} radius={16} />
      </View>
      <Text className="text-center font-heading-medium text-base text-ink dark:text-ink-dark mt-2">
        {steps[idx]}
      </Text>
    </View>
  );
}

function ErrorView({
  message,
  readOnly,
  onRetry,
}: {
  message: string;
  readOnly: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-5">
      <CircleAlert size={48} color="#E24C4C" />
      <Text className="font-heading-medium text-base text-center text-ink dark:text-ink-dark">
        {message}
      </Text>
      <PrimaryButton
        label={readOnly ? t('common.close') : t('result.scanAgain')}
        icon={readOnly ? 'arrow-back-outline' : 'scan-outline'}
        onPress={onRetry}
        style={{ alignSelf: 'stretch', marginHorizontal: 16 }}
      />
    </View>
  );
}

function ScoreHero({ result }: { result: AnalysisResult }) {
  const { t } = useTranslation();
  const attention = result.ingredients.filter((i) => i.risk !== 'safe').length;
  return (
    <View className="items-center gap-1 pt-2">
      <ScoreRing value={result.healthScore} size={130} showGrade />
      <Text className="font-heading text-xl text-ink dark:text-ink-dark mt-2">
        {result.productName ?? t('common.unknownProduct')}
      </Text>
      <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">
        {attention > 0
          ? t(attention === 1 ? 'result.attentionOne' : 'result.attentionOther', {
              count: attention,
            })
          : t('result.allClear')}
      </Text>
    </View>
  );
}

function PersonalAlerts({ alerts }: { alerts: PersonalAlert[] }) {
  const { t } = useTranslation();
  return (
    <View className="gap-2">
      {alerts.map((a, i) => {
        const s = ALERT_STYLE[a.severity === 'risk' ? 'risk' : 'caution'];
        const Icon = s.Icon;
        return (
          <View
            key={`${a.ingredient}-${i}`}
            className={`flex-row items-center gap-3 rounded-2xl px-4 py-3.5 ${s.box}`}>
            <Icon size={20} color={s.icon} />
            <View className="flex-1">
              <Text className={`font-body-bold text-[15px] ${s.title}`}>
                {a.ingredient}
              </Text>
              <Text className={`font-body-medium text-[12px] ${s.sub}`}>
                {t('result.contains', { label: t(a.matchLabelKey) })}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function NoAlerts() {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center gap-3 rounded-2xl px-4 py-3.5 bg-safe/10">
      <CircleCheck size={20} color="#7CB342" />
      <Text className="flex-1 font-body-medium text-sm text-ink dark:text-ink-dark">
        {t('result.noAlerts')}
      </Text>
    </View>
  );
}

function IngredientRow({
  ingredient,
  last,
  onPress,
}: {
  ingredient: IngredientAnalysis;
  last: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const meta = RISK_META[ingredient.risk];

  return (
    <PressableScale
      haptic="light"
      onPress={onPress}
      accessibilityLabel={`${ingredient.name}, ${t(meta.labelKey)}`}
      style={{ width: '100%' }}>
      <View
        className={`flex-row items-center justify-between py-3.5 ${
          last ? '' : 'border-b border-border dark:border-border-dark'
        }`}>
        <Text
          numberOfLines={1}
          className="flex-1 pr-3 font-body-medium text-[15px] text-ink dark:text-ink-dark">
          {ingredient.name}
        </Text>
        <Pill label={t(meta.labelKey)} tone={meta.tone} />
      </View>
    </PressableScale>
  );
}

function ScoreBreakdown({ result }: { result: AnalysisResult }) {
  const { t } = useTranslation();
  const rows: { labelKey: string; value: number; max: number }[] = [
    { labelKey: 'result.breakdownProcessing', value: result.scoreBreakdown.processing, max: 40 },
    { labelKey: 'result.breakdownAdditives', value: result.scoreBreakdown.additives, max: 35 },
    { labelKey: 'result.breakdownNutrition', value: result.scoreBreakdown.nutrition, max: 25 },
  ];
  return (
    <View className="gap-3">
      <Text className="font-heading text-lg text-ink dark:text-ink-dark">
        {t('result.breakdownTitle')}
      </Text>
      <View className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4 gap-3">
        {rows.map((r) => {
          const pct = r.max === 0 ? 0 : Math.round((r.value / r.max) * 100);
          const c = pct >= 66 ? '#E24C4C' : pct >= 33 ? '#F5A623' : '#7CB342';
          return (
            <View key={r.labelKey} className="gap-1.5">
              <Text className="font-body-medium text-[13px] text-ink-muted dark:text-ink-dark-muted">
                {t(r.labelKey)}
              </Text>
              <View className="h-2 rounded-pill overflow-hidden bg-border dark:bg-border-dark">
                <MotiView
                  from={{ width: '0%' }}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: 'timing', duration: 700 }}
                  style={{ height: '100%', borderRadius: 999, backgroundColor: c }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
