import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  Flame,
  Package,
  PieChart,
  Target,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarChart, type BarDatum } from '@/components/charts/bar-chart';
import { DonutChart, type DonutSegment } from '@/components/charts/donut-chart';
import { ScoreLineChart, type SeriesPoint } from '@/components/charts/score-line-chart';
import { PeriodToggle } from '@/components/ui/period-toggle';
import { PlanGate } from '@/components/ui/plan-gate';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Reveal } from '@/components/ui/reveal';
import { ScoreRing } from '@/components/ui/score-ring';
import { SegmentControl, type SegmentItem } from '@/components/ui/segment-control';
import { requiredPlanFor } from '@/data/plans';
import { periodCutoff, type ReportPeriod } from '@/data/report-period';
import { useHasFeature } from '@/hooks/use-plan';
import type { MealFood, RiskLevel } from '@/services/analysis/types';
import { useDailyTargets } from '@/store/profile';
import { useMeals, type MealRecord } from '@/store/meals';
import { useScans, type ScanRecord } from '@/store/scans';
import {
  accentLime,
  accentMeal,
  getScore,
  scoreColors,
  stateColors,
  useThemeColors,
  type ScoreGrade,
} from '@/theme';

const RISK_LABEL_KEY: Record<RiskLevel, string> = {
  safe: 'result.riskSafe',
  caution: 'result.riskCaution',
  risk: 'result.riskRisk',
};
const GRADES: ScoreGrade[] = ['A', 'B', 'C', 'D', 'E'];

type ReportMode = 'product' | 'meal';

const MODE_SEGMENTS: SegmentItem<ReportMode>[] = [
  { key: 'product', labelKey: 'scan.modeProduct', Icon: Package },
  { key: 'meal', labelKey: 'scan.modeMeal', Icon: UtensilsCrossed },
];

const MEAL_QUALITY_COLOR: Record<MealFood['quality'], string> = {
  good: stateColors.safe,
  ok: stateColors.caution,
  poor: stateColors.risk,
};
const MEAL_QUALITY_LABEL_KEY: Record<MealFood['quality'], string> = {
  good: 'healthReport.qualityGood',
  ok: 'healthReport.qualityOk',
  poor: 'healthReport.qualityPoor',
};

export default function HealthReportRoute() {
  const { t } = useTranslation();
  const unlocked = useHasFeature('healthReport');

  if (!unlocked) {
    return (
      <PlanGate
        Icon={PieChart}
        title={t('plans.lockedHealthReportTitle')}
        message={t('plans.lockedHealthReportMessage')}
        requiredPlan={requiredPlanFor('healthReport')}
      />
    );
  }
  return <HealthReportScreen />;
}

function HealthReportScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const { period: initialPeriod } = useLocalSearchParams<{ period?: ReportPeriod }>();
  const [period, setPeriod] = useState<ReportPeriod>(
    initialPeriod === 'month' ? 'month' : 'week',
  );
  const [mode, setMode] = useState<ReportMode>('product');

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
            {t('healthReport.title')}
          </Text>
        </View>

        <View className="px-4 pt-2">
          <DailyTargetCard />
        </View>

        <View className="px-4 pt-2 pb-1">
          <SegmentControl segments={MODE_SEGMENTS} value={mode} onChange={setMode} />
        </View>

        {mode === 'product' ? (
          <ProductReport period={period} onPeriodChange={setPeriod} />
        ) : (
          <MealReport period={period} onPeriodChange={setPeriod} />
        )}
      </SafeAreaView>
    </View>
  );
}

function DailyTargetCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const targets = useDailyTargets();

  if (!targets) {
    return (
      <PressableScale
        haptic="light"
        accessibilityLabel={t('targets.setGoalCta')}
        onPress={() => router.push('/edit-goal')}>
        <View className="flex-row items-center gap-3 rounded-2xl p-4 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: `${accentLime}22` }}>
            <Target size={20} color={accentLime} />
          </View>
          <View className="flex-1">
            <Text className="font-heading text-[15px] text-ink dark:text-ink-dark">
              {t('targets.setGoalTitle')}
            </Text>
            <Text className="font-body text-[12.5px] text-ink-muted dark:text-ink-dark-muted">
              {t('targets.setGoalSubtitle')}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </View>
      </PressableScale>
    );
  }

  return (
    <View className="rounded-2xl p-4 gap-3 bg-[#101410] dark:bg-surface-dark dark:border dark:border-border-dark">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Target size={16} color={accentLime} />
          <Text className="font-heading text-[14px] text-white">{t('targets.dailyTarget')}</Text>
        </View>
        <PressableScale
          haptic="selection"
          accessibilityLabel={t('common.edit')}
          onPress={() => router.push('/edit-goal')}>
          <Text className="font-body-medium text-[12px]" style={{ color: accentLime }}>
            {t('common.edit')}
          </Text>
        </PressableScale>
      </View>
      <View className="flex-row items-end gap-2">
        <Text className="font-display text-[28px] leading-8" style={{ color: accentLime }}>
          {targets.kcal.toLocaleString()}
        </Text>
        <Text className="font-body text-[13px] text-white/70 mb-1">
          {t('targets.kcalPerDay')}
        </Text>
      </View>
      <View className="flex-row gap-2">
        <MacroPill label={t('targets.protein')} value={targets.protein} />
        <MacroPill label={t('targets.carbs')} value={targets.carbs} />
        <MacroPill label={t('targets.fat')} value={targets.fat} />
      </View>
    </View>
  );
}

function MacroPill({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 items-center rounded-xl py-2 bg-white/10">
      <Text className="font-body-bold text-[15px] text-white tabular-nums">{value}g</Text>
      <Text className="font-body text-[11px] text-white/60">{label}</Text>
    </View>
  );
}

function ProductReport({
  period,
  onPeriodChange,
}: {
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
}) {
  const { t, i18n } = useTranslation();
  const scans = useScans((s) => s.scans);
  const consumedScans = useMemo(() => scans.filter((s) => s.consumed), [scans]);
  const periodScans = useMemo(() => {
    const cutoff = periodCutoff(period);
    return consumedScans
      .filter((s) => s.createdAt >= cutoff)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [consumedScans, period]);

  const count = periodScans.length;
  const avg = count
    ? Math.round(periodScans.reduce((sum, r) => sum + r.healthScore, 0) / count)
    : 0;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-4 pb-10 gap-5 pt-3">
      <Reveal index={0}>
        <HeroSummary
          period={period}
          onPeriodChange={onPeriodChange}
          count={count}
          avg={avg}
          avgText={t(period === 'week' ? 'home.heroAvgWeek' : 'home.heroAvgMonth')}
          countText={t('home.scanCount', { count })}
        />
      </Reveal>

      {count === 0 ? (
        <Reveal index={1}>
          <EmptyState hasAnyConsumed={consumedScans.length > 0} hint={t('healthReport.emptyHint')} />
        </Reveal>
      ) : (
        <>
          <Reveal index={1}>
            <TrendSection scans={periodScans} avg={avg} lang={i18n.language} />
          </Reveal>
          <Reveal index={2}>
            <GradeDistribution scans={periodScans} />
          </Reveal>
          <Reveal index={3}>
            <RiskDonut scans={periodScans} />
          </Reveal>
          <Reveal index={4}>
            <BestWorst scans={periodScans} />
          </Reveal>
          <Reveal index={5}>
            <AvgBreakdown scans={periodScans} />
          </Reveal>
          <Reveal index={6}>
            <TopFlagged scans={periodScans} />
          </Reveal>
          <Reveal index={7}>
            <Disclaimer />
          </Reveal>
        </>
      )}
    </ScrollView>
  );
}

function MealReport({
  period,
  onPeriodChange,
}: {
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
}) {
  const { t, i18n } = useTranslation();
  const meals = useMeals((s) => s.meals);
  const periodMeals = useMemo(() => {
    const cutoff = periodCutoff(period);
    return meals
      .filter((m) => m.createdAt >= cutoff)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [meals, period]);

  const count = periodMeals.length;
  const avg = count
    ? Math.round(periodMeals.reduce((sum, m) => sum + m.mealScore, 0) / count)
    : 0;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-4 pb-10 gap-5 pt-3">
      <Reveal index={0}>
        <HeroSummary
          period={period}
          onPeriodChange={onPeriodChange}
          count={count}
          avg={avg}
          ringColor={accentMeal}
          countColor={accentMeal}
          avgText={t(period === 'week' ? 'healthReport.heroAvgMealWeek' : 'healthReport.heroAvgMealMonth')}
          countText={t('healthReport.mealCount', { count })}
        />
      </Reveal>

      {count === 0 ? (
        <Reveal index={1}>
          <EmptyState hasAnyConsumed={meals.length > 0} hint={t('healthReport.mealEmptyHint')} />
        </Reveal>
      ) : (
        <>
          <Reveal index={1}>
            <CalorieSection meals={periodMeals} lang={i18n.language} />
          </Reveal>
          <Reveal index={2}>
            <MealTrendSection meals={periodMeals} avg={avg} lang={i18n.language} />
          </Reveal>
          <Reveal index={3}>
            <MacroDonut meals={periodMeals} />
          </Reveal>
          <Reveal index={4}>
            <FoodQuality meals={periodMeals} />
          </Reveal>
          <Reveal index={5}>
            <MealBreakdown meals={periodMeals} />
          </Reveal>
          <Reveal index={6}>
            <BestWorstMeal meals={periodMeals} />
          </Reveal>
          <Reveal index={7}>
            <TopFoods meals={periodMeals} />
          </Reveal>
          <Reveal index={8}>
            <Disclaimer />
          </Reveal>
        </>
      )}
    </ScrollView>
  );
}

function Disclaimer() {
  const { t } = useTranslation();
  return (
    <Text className="font-body text-xs leading-4 text-center text-ink-muted dark:text-ink-dark-muted">
      {t('result.disclaimer')}
    </Text>
  );
}

function SectionHeader({
  title,
  subtitle,
  Icon,
  iconColor,
}: {
  title: string;
  subtitle?: string;
  Icon?: typeof TrendingUp;
  iconColor?: string;
}) {
  const colors = useThemeColors();
  return (
    <View className="gap-0.5">
      <View className="flex-row items-center gap-2">
        {Icon && <Icon size={18} color={iconColor ?? colors.text} />}
        <Text className="font-heading text-lg text-ink dark:text-ink-dark">{title}</Text>
      </View>
      {!!subtitle && (
        <Text className="font-body text-xs text-ink-muted dark:text-ink-dark-muted">
          {subtitle}
        </Text>
      )}
    </View>
  );
}

function ChartCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4">
      {children}
    </View>
  );
}

function HeroSummary({
  period,
  onPeriodChange,
  count,
  avg,
  avgText,
  countText,
  ringColor,
  countColor = '#DFFB4B',
}: {
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
  count: number;
  avg: number;
  avgText: string;
  countText: string;
  ringColor?: string;
  countColor?: string;
}) {
  const { t } = useTranslation();
  return (
    <View className="p-6 rounded-[28px] gap-3 bg-[#101410] dark:bg-surface-dark dark:border dark:border-border-dark">
      <View className="flex-row items-start justify-between">
        <PeriodToggle value={period} onChange={onPeriodChange} />
      </View>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 gap-1 pr-3">
          <Text className="font-body text-[13px] text-white/85">
            {count > 0 ? avgText : t('home.heroEmptyPeriod')}
          </Text>
          {count > 0 && (
            <Text className="font-body-medium text-xs" style={{ color: countColor }}>
              {countText}
            </Text>
          )}
        </View>
        {count > 0 && (
          <ScoreRing
            value={avg}
            size={104}
            showGrade={false}
            textColor="#FFFFFF"
            ringColor={ringColor}
          />
        )}
      </View>
    </View>
  );
}

function EmptyState({ hasAnyConsumed, hint }: { hasAnyConsumed: boolean; hint: string }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  return (
    <View className="items-center justify-center pt-10 px-8 gap-3">
      <PieChart size={40} color={colors.textMuted} />
      <Text className="font-heading text-base text-ink dark:text-ink-dark text-center">
        {hasAnyConsumed ? t('home.heroEmptyPeriod') : t('home.heroEmpty')}
      </Text>
      <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted text-center">
        {hint}
      </Text>
    </View>
  );
}

function TrendSection({
  scans,
  avg,
  lang,
}: {
  scans: ScanRecord[];
  avg: number;
  lang: string;
}) {
  const { t } = useTranslation();

  const points: SeriesPoint[] = useMemo(() => {
    const byDay = new Map<number, { sum: number; n: number }>();
    for (const s of scans) {
      const day = new Date(s.createdAt).setHours(0, 0, 0, 0);
      const cur = byDay.get(day);
      if (cur) {
        cur.sum += s.healthScore;
        cur.n++;
      } else {
        byDay.set(day, { sum: s.healthScore, n: 1 });
      }
    }
    return [...byDay.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([ts, v]) => ({ ts, value: Math.round(v.sum / v.n) }));
  }, [scans]);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(lang, { day: 'numeric', month: 'short' });

  return (
    <View className="gap-3">
      <SectionHeader
        title={t('healthReport.trendTitle')}
        subtitle={t('healthReport.trendSubtitle')}
        Icon={TrendingUp}
      />
      <ChartCard>
        {points.length < 2 ? (
          <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted text-center py-6">
            {t('healthReport.trendNeedsMore')}
          </Text>
        ) : (
          <ScoreLineChart
            points={points}
            avg={avg}
            formatDate={formatDate}
            avgLabel={t('healthReport.avgLabel')}
          />
        )}
      </ChartCard>
    </View>
  );
}

function GradeDistribution({ scans }: { scans: ScanRecord[] }) {
  const { t } = useTranslation();

  const counts = useMemo(() => {
    const c: Record<ScoreGrade, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    for (const s of scans) c[getScore(s.healthScore).grade]++;
    return c;
  }, [scans]);

  const max = Math.max(...GRADES.map((g) => counts[g]), 1);
  const total = scans.length;

  return (
    <View className="gap-3">
      <SectionHeader
        title={t('healthReport.gradeDistTitle')}
        subtitle={t('healthReport.gradeDistSubtitle')}
      />
      <ChartCard>
        <View className="gap-2.5">
          {GRADES.map((g) => {
            const n = counts[g];
            const pct = total ? Math.round((n / total) * 100) : 0;
            return (
              <View key={g} className="flex-row items-center gap-3">
                <View
                  className="w-6 h-6 rounded-lg items-center justify-center"
                  style={{ backgroundColor: `${scoreColors[g]}22` }}>
                  <Text
                    className="font-body-bold text-[11px]"
                    style={{ color: scoreColors[g] }}>
                    {g}
                  </Text>
                </View>
                <View className="flex-1 h-2.5 rounded-pill overflow-hidden bg-border dark:bg-border-dark">
                  <MotiView
                    from={{ width: '0%' }}
                    animate={{ width: `${(n / max) * 100}%` }}
                    transition={{ type: 'timing', duration: 600 }}
                    style={{ height: '100%', borderRadius: 999, backgroundColor: scoreColors[g] }}
                  />
                </View>
                <Text className="font-body-medium text-[12px] text-ink-muted dark:text-ink-dark-muted tabular-nums w-14 text-right">
                  {n} · %{pct}
                </Text>
              </View>
            );
          })}
        </View>
      </ChartCard>
    </View>
  );
}

function RiskDonut({ scans }: { scans: ScanRecord[] }) {
  const { t } = useTranslation();

  const counts = useMemo(() => {
    const c: Record<RiskLevel, number> = { safe: 0, caution: 0, risk: 0 };
    for (const s of scans) for (const ing of s.ingredients) c[ing.risk]++;
    return c;
  }, [scans]);
  const total = counts.safe + counts.caution + counts.risk;

  const segments: DonutSegment[] = [
    { key: 'safe', value: counts.safe, color: stateColors.safe },
    { key: 'caution', value: counts.caution, color: stateColors.caution },
    { key: 'risk', value: counts.risk, color: stateColors.risk },
  ];

  return (
    <View className="gap-3">
      <SectionHeader
        title={t('healthReport.riskDistTitle')}
        subtitle={t('healthReport.riskDistSubtitle')}
      />
      <ChartCard>
        {total === 0 ? (
          <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted text-center py-4">
            {t('healthReport.topFlaggedEmpty')}
          </Text>
        ) : (
          <View className="flex-row items-center gap-5">
            <DonutChart
              segments={segments}
              centerValue={String(total)}
              centerLabel={t('healthReport.ingredientsLabel')}
            />
            <View className="flex-1 gap-2.5">
              {(['safe', 'caution', 'risk'] as const).map((k) => {
                const pct = Math.round((counts[k] / total) * 100);
                return (
                  <View key={k} className="gap-1">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <View
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: stateColors[k] }}
                        />
                        <Text className="font-body text-[13px] text-ink dark:text-ink-dark">
                          {t(RISK_LABEL_KEY[k])}
                        </Text>
                      </View>
                      <Text className="font-body-bold text-[13px] text-ink dark:text-ink-dark tabular-nums">
                        %{pct}
                      </Text>
                    </View>
                    <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted">
                      {t('healthReport.ingredientCount', { count: counts[k] })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ChartCard>
    </View>
  );
}

function BestWorst({ scans }: { scans: ScanRecord[] }) {
  const { t } = useTranslation();

  const { best, worst } = useMemo(() => {
    let b = scans[0];
    let w = scans[0];
    for (const s of scans) {
      if (s.healthScore > b.healthScore) b = s;
      if (s.healthScore < w.healthScore) w = s;
    }
    return { best: b, worst: w };
  }, [scans]);

  if (scans.length < 2) return null;

  return (
    <View className="gap-3">
      <SectionHeader title={t('healthReport.bestWorstTitle')} />
      <View className="flex-row gap-3">
        <HighlightCard
          record={best}
          label={t('healthReport.bestLabel')}
          Icon={ThumbsUp}
          tint={stateColors.safe}
        />
        <HighlightCard
          record={worst}
          label={t('healthReport.worstLabel')}
          Icon={ThumbsDown}
          tint={stateColors.risk}
        />
      </View>
    </View>
  );
}

function HighlightCard({
  record,
  label,
  Icon,
  tint,
}: {
  record: ScanRecord;
  label: string;
  Icon: typeof ThumbsUp;
  tint: string;
}) {
  const { t } = useTranslation();
  const { grade, color } = getScore(record.healthScore);
  return (
    <View className="flex-1 rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-3.5 gap-2">
      <View className="flex-row items-center gap-1.5">
        <Icon size={14} color={tint} />
        <Text className="font-body-bold text-[11px] tracking-wide" style={{ color: tint }}>
          {label}
        </Text>
      </View>
      <Text
        numberOfLines={2}
        className="font-body-medium text-[13px] text-ink dark:text-ink-dark min-h-[34px]">
        {record.productName ?? t('common.unknownProduct')}
      </Text>
      <View className="self-start rounded-pill px-2.5 py-1" style={{ backgroundColor: `${color}22` }}>
        <Text className="font-body-bold text-[12px] tabular-nums" style={{ color }}>
          {grade} · {record.healthScore}
        </Text>
      </View>
    </View>
  );
}

function AvgBreakdown({ scans }: { scans: ScanRecord[] }) {
  const { t } = useTranslation();
  const n = scans.length;
  const rows: { labelKey: string; value: number; max: number }[] = [
    {
      labelKey: 'result.breakdownProcessing',
      value: n ? scans.reduce((s, r) => s + r.scoreBreakdown.processing, 0) / n : 0,
      max: 40,
    },
    {
      labelKey: 'result.breakdownAdditives',
      value: n ? scans.reduce((s, r) => s + r.scoreBreakdown.additives, 0) / n : 0,
      max: 35,
    },
    {
      labelKey: 'result.breakdownNutrition',
      value: n ? scans.reduce((s, r) => s + r.scoreBreakdown.nutrition, 0) / n : 0,
      max: 25,
    },
  ];

  return (
    <View className="gap-3">
      <SectionHeader
        title={t('result.breakdownTitle')}
        subtitle={t('healthReport.breakdownSubtitle')}
      />
      <ChartCard>
        <View className="gap-3">
          {rows.map((r) => {
            const pct = r.max === 0 ? 0 : Math.round((r.value / r.max) * 100);
            const c =
              pct >= 66 ? stateColors.risk : pct >= 33 ? stateColors.caution : stateColors.safe;
            return (
              <View key={r.labelKey} className="gap-1.5">
                <View className="flex-row items-center justify-between">
                  <Text className="font-body-medium text-[13px] text-ink-muted dark:text-ink-dark-muted">
                    {t(r.labelKey)}
                  </Text>
                  <Text
                    className="font-body-bold text-[12px] tabular-nums"
                    style={{ color: c }}>
                    %{pct}
                  </Text>
                </View>
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
      </ChartCard>
    </View>
  );
}

const TOP_FLAGGED_LIMIT = 8;

function TopFlagged({ scans }: { scans: ScanRecord[] }) {
  const { t } = useTranslation();

  const ranked = useMemo(() => {
    const tally = new Map<string, { count: number; risk: RiskLevel }>();
    for (const s of scans) {
      for (const ing of s.ingredients) {
        if (ing.risk === 'safe') continue;
        const cur = tally.get(ing.name);
        if (cur) {
          cur.count++;
          if (ing.risk === 'risk') cur.risk = 'risk';
        } else {
          tally.set(ing.name, { count: 1, risk: ing.risk });
        }
      }
    }
    return [...tally.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, TOP_FLAGGED_LIMIT);
  }, [scans]);

  const max = ranked.length ? ranked[0][1].count : 1;

  return (
    <View className="gap-3">
      <SectionHeader
        title={t('healthReport.topFlaggedTitle')}
        subtitle={t('healthReport.topFlaggedSubtitle')}
      />
      <ChartCard>
        {ranked.length === 0 ? (
          <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted text-center py-4">
            {t('healthReport.topFlaggedEmpty')}
          </Text>
        ) : (
          <View className="gap-3">
            {ranked.map(([name, info]) => {
              const c = info.risk === 'risk' ? stateColors.risk : stateColors.caution;
              return (
                <View key={name} className="gap-1.5">
                  <View className="flex-row items-center justify-between gap-3">
                    <Text
                      numberOfLines={1}
                      className="flex-1 font-body-medium text-[13px] text-ink dark:text-ink-dark">
                      {name}
                    </Text>
                    <Text
                      className="font-body-bold text-[12px] tabular-nums"
                      style={{ color: c }}>
                      {t('healthReport.timesSeen', { count: info.count })}
                    </Text>
                  </View>
                  <View className="h-1.5 rounded-pill overflow-hidden bg-border dark:bg-border-dark">
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ width: `${(info.count / max) * 100}%` }}
                      transition={{ type: 'timing', duration: 600 }}
                      style={{ height: '100%', borderRadius: 999, backgroundColor: c }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ChartCard>
    </View>
  );
}

const startOfDay = (ms: number) => new Date(ms).setHours(0, 0, 0, 0);

const MACRO_COLOR = { protein: '#4FC3F7', carbs: '#FFB74D', fat: '#BA68C8' } as const;

function CalorieSection({ meals, lang }: { meals: MealRecord[]; lang: string }) {
  const { t } = useTranslation();

  const { bars, avgPerDay, avgPerMeal } = useMemo(() => {
    const byDay = new Map<number, number>();
    let total = 0;
    for (const m of meals) {
      const day = startOfDay(m.createdAt);
      byDay.set(day, (byDay.get(day) ?? 0) + m.estCalories);
      total += m.estCalories;
    }
    const entries = [...byDay.entries()].sort((a, b) => a[0] - b[0]);
    const bars: BarDatum[] = entries.map(([ts, kcal]) => ({
      key: String(ts),
      label: new Date(ts).toLocaleDateString(lang, { day: 'numeric', month: 'short' }),
      value: kcal,
    }));
    return {
      bars,
      avgPerDay: entries.length ? Math.round(total / entries.length) : 0,
      avgPerMeal: meals.length ? Math.round(total / meals.length) : 0,
    };
  }, [meals, lang]);

  return (
    <View className="gap-3">
      <SectionHeader
        title={t('healthReport.calorieTitle')}
        subtitle={t('healthReport.calorieSubtitle')}
        Icon={Flame}
        iconColor={accentMeal}
      />
      <ChartCard>
        <View className="flex-row gap-3 mb-3">
          <MiniStat label={t('healthReport.calorieAvgDay')} value={t('meal.kcal', { count: avgPerDay })} />
          <MiniStat label={t('healthReport.calorieAvgMeal')} value={t('meal.kcal', { count: avgPerMeal })} />
        </View>
        <BarChart data={bars} color={accentMeal} formatValue={(n) => String(n)} />
      </ChartCard>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-cream dark:bg-surface-raised-dark p-3 gap-0.5">
      <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted">{label}</Text>
      <Text className="font-display text-[18px] text-ink dark:text-ink-dark tabular-nums">
        {value}
      </Text>
    </View>
  );
}

function MealTrendSection({
  meals,
  avg,
  lang,
}: {
  meals: MealRecord[];
  avg: number;
  lang: string;
}) {
  const { t } = useTranslation();

  const points: SeriesPoint[] = useMemo(() => {
    const byDay = new Map<number, { sum: number; n: number }>();
    for (const m of meals) {
      const day = startOfDay(m.createdAt);
      const cur = byDay.get(day);
      if (cur) {
        cur.sum += m.mealScore;
        cur.n++;
      } else {
        byDay.set(day, { sum: m.mealScore, n: 1 });
      }
    }
    return [...byDay.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([ts, v]) => ({ ts, value: Math.round(v.sum / v.n) }));
  }, [meals]);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(lang, { day: 'numeric', month: 'short' });

  return (
    <View className="gap-3">
      <SectionHeader
        title={t('healthReport.mealTrendTitle')}
        subtitle={t('healthReport.mealTrendSubtitle')}
        Icon={TrendingUp}
        iconColor={accentMeal}
      />
      <ChartCard>
        {points.length < 2 ? (
          <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted text-center py-6">
            {t('healthReport.mealTrendNeedsMore')}
          </Text>
        ) : (
          <ScoreLineChart
            points={points}
            avg={avg}
            formatDate={formatDate}
            avgLabel={t('healthReport.avgLabel')}
            color={accentMeal}
          />
        )}
      </ChartCard>
    </View>
  );
}

function MacroDonut({ meals }: { meals: MealRecord[] }) {
  const { t } = useTranslation();

  const { avg, hasData } = useMemo(() => {
    const withMacros = meals.filter((m) => m.macros != null);
    if (withMacros.length === 0) return { avg: { protein: 0, carbs: 0, fat: 0 }, hasData: false };
    const sum = withMacros.reduce(
      (acc, m) => ({
        protein: acc.protein + (m.macros?.protein ?? 0),
        carbs: acc.carbs + (m.macros?.carbs ?? 0),
        fat: acc.fat + (m.macros?.fat ?? 0),
      }),
      { protein: 0, carbs: 0, fat: 0 },
    );
    const n = withMacros.length;
    return {
      avg: {
        protein: Math.round(sum.protein / n),
        carbs: Math.round(sum.carbs / n),
        fat: Math.round(sum.fat / n),
      },
      hasData: true,
    };
  }, [meals]);

  const total = avg.protein + avg.carbs + avg.fat;
  const segments: DonutSegment[] = [
    { key: 'protein', value: avg.protein, color: MACRO_COLOR.protein },
    { key: 'carbs', value: avg.carbs, color: MACRO_COLOR.carbs },
    { key: 'fat', value: avg.fat, color: MACRO_COLOR.fat },
  ];
  const macroRows = [
    { key: 'protein' as const, labelKey: 'meal.protein', grams: avg.protein },
    { key: 'carbs' as const, labelKey: 'meal.carbs', grams: avg.carbs },
    { key: 'fat' as const, labelKey: 'meal.fat', grams: avg.fat },
  ];

  return (
    <View className="gap-3">
      <SectionHeader
        title={t('healthReport.macroTitle')}
        subtitle={t('healthReport.macroSubtitle')}
      />
      <ChartCard>
        {!hasData || total === 0 ? (
          <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted text-center py-4">
            {t('healthReport.macroEmpty')}
          </Text>
        ) : (
          <View className="flex-row items-center gap-5">
            <DonutChart
              segments={segments}
              centerValue={t('meal.grams', { count: total })}
              centerLabel={t('healthReport.macroTotalLabel')}
            />
            <View className="flex-1 gap-2.5">
              {macroRows.map((row) => {
                const pct = Math.round((row.grams / total) * 100);
                return (
                  <View key={row.key} className="gap-1">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <View
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: MACRO_COLOR[row.key] }}
                        />
                        <Text className="font-body text-[13px] text-ink dark:text-ink-dark">
                          {t(row.labelKey)}
                        </Text>
                      </View>
                      <Text className="font-body-bold text-[13px] text-ink dark:text-ink-dark tabular-nums">
                        %{pct}
                      </Text>
                    </View>
                    <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted">
                      {t('meal.grams', { count: row.grams })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ChartCard>
    </View>
  );
}

function FoodQuality({ meals }: { meals: MealRecord[] }) {
  const { t } = useTranslation();

  const counts = useMemo(() => {
    const c: Record<MealFood['quality'], number> = { good: 0, ok: 0, poor: 0 };
    for (const m of meals) for (const f of m.foods) c[f.quality]++;
    return c;
  }, [meals]);

  const total = counts.good + counts.ok + counts.poor;
  const order: MealFood['quality'][] = ['good', 'ok', 'poor'];
  const max = Math.max(counts.good, counts.ok, counts.poor, 1);

  return (
    <View className="gap-3">
      <SectionHeader
        title={t('healthReport.foodQualityTitle')}
        subtitle={t('healthReport.foodQualitySubtitle')}
      />
      <ChartCard>
        {total === 0 ? (
          <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted text-center py-4">
            {t('healthReport.macroEmpty')}
          </Text>
        ) : (
          <View className="gap-2.5">
            {order.map((q) => {
              const n = counts[q];
              const pct = Math.round((n / total) * 100);
              const c = MEAL_QUALITY_COLOR[q];
              return (
                <View key={q} className="flex-row items-center gap-3">
                  <Text
                    className="font-body-medium text-[12px] w-12"
                    style={{ color: c }}>
                    {t(MEAL_QUALITY_LABEL_KEY[q])}
                  </Text>
                  <View className="flex-1 h-2.5 rounded-pill overflow-hidden bg-border dark:bg-border-dark">
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ width: `${(n / max) * 100}%` }}
                      transition={{ type: 'timing', duration: 600 }}
                      style={{ height: '100%', borderRadius: 999, backgroundColor: c }}
                    />
                  </View>
                  <Text className="font-body-medium text-[12px] text-ink-muted dark:text-ink-dark-muted tabular-nums w-14 text-right">
                    {n} · %{pct}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ChartCard>
    </View>
  );
}

function MealBreakdown({ meals }: { meals: MealRecord[] }) {
  const { t } = useTranslation();
  const n = meals.length;
  const rows: { labelKey: string; value: number; max: number }[] = [
    {
      labelKey: 'healthReport.mealProcessing',
      value: n ? meals.reduce((s, m) => s + m.scoreBreakdown.processing, 0) / n : 0,
      max: 32,
    },
    {
      labelKey: 'healthReport.mealQualityPenalty',
      value: n ? meals.reduce((s, m) => s + m.scoreBreakdown.quality, 0) / n : 0,
      max: 30,
    },
    {
      labelKey: 'healthReport.mealBalance',
      value: n ? meals.reduce((s, m) => s + m.scoreBreakdown.balance, 0) / n : 0,
      max: 22,
    },
  ];

  return (
    <View className="gap-3">
      <SectionHeader
        title={t('healthReport.mealBreakdownTitle')}
        subtitle={t('healthReport.breakdownSubtitle')}
      />
      <ChartCard>
        <View className="gap-3">
          {rows.map((r) => {
            const pct = r.max === 0 ? 0 : Math.round((r.value / r.max) * 100);
            const c =
              pct >= 66 ? stateColors.risk : pct >= 33 ? stateColors.caution : stateColors.safe;
            return (
              <View key={r.labelKey} className="gap-1.5">
                <View className="flex-row items-center justify-between">
                  <Text className="font-body-medium text-[13px] text-ink-muted dark:text-ink-dark-muted">
                    {t(r.labelKey)}
                  </Text>
                  <Text className="font-body-bold text-[12px] tabular-nums" style={{ color: c }}>
                    %{pct}
                  </Text>
                </View>
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
      </ChartCard>
    </View>
  );
}

function BestWorstMeal({ meals }: { meals: MealRecord[] }) {
  const { t } = useTranslation();

  const { best, worst } = useMemo(() => {
    let b = meals[0];
    let w = meals[0];
    for (const m of meals) {
      if (m.mealScore > b.mealScore) b = m;
      if (m.mealScore < w.mealScore) w = m;
    }
    return { best: b, worst: w };
  }, [meals]);

  if (meals.length < 2) return null;

  return (
    <View className="gap-3">
      <SectionHeader title={t('healthReport.bestWorstMealTitle')} />
      <View className="flex-row gap-3">
        <MealHighlightCard
          record={best}
          label={t('healthReport.bestLabel')}
          Icon={ThumbsUp}
          tint={stateColors.safe}
        />
        <MealHighlightCard
          record={worst}
          label={t('healthReport.worstLabel')}
          Icon={ThumbsDown}
          tint={stateColors.risk}
        />
      </View>
    </View>
  );
}

function MealHighlightCard({
  record,
  label,
  Icon,
  tint,
}: {
  record: MealRecord;
  label: string;
  Icon: typeof ThumbsUp;
  tint: string;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-3.5 gap-2">
      <View className="flex-row items-center gap-1.5">
        <Icon size={14} color={tint} />
        <Text className="font-body-bold text-[11px] tracking-wide" style={{ color: tint }}>
          {label}
        </Text>
      </View>
      <Text
        numberOfLines={2}
        className="font-body-medium text-[13px] text-ink dark:text-ink-dark min-h-[34px]">
        {record.mealName ?? t('meal.untitled')}
      </Text>
      <View className="flex-row items-center gap-2">
        <View className="rounded-pill px-2.5 py-1" style={{ backgroundColor: `${accentMeal}22` }}>
          <Text className="font-body-bold text-[12px] tabular-nums" style={{ color: accentMeal }}>
            {record.mealScore}
          </Text>
        </View>
        <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted tabular-nums">
          {t('meal.kcal', { count: record.estCalories })}
        </Text>
      </View>
    </View>
  );
}

const TOP_FOODS_LIMIT = 8;

function TopFoods({ meals }: { meals: MealRecord[] }) {
  const { t } = useTranslation();

  const ranked = useMemo(() => {
    const tally = new Map<string, { count: number; quality: MealFood['quality'] }>();
    for (const m of meals) {
      for (const f of m.foods) {
        const key = f.name.trim();
        if (!key) continue;
        const cur = tally.get(key);
        if (cur) {
          cur.count++;
          if (f.quality === 'poor') cur.quality = 'poor';
          else if (f.quality === 'ok' && cur.quality === 'good') cur.quality = 'ok';
        } else {
          tally.set(key, { count: 1, quality: f.quality });
        }
      }
    }
    return [...tally.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, TOP_FOODS_LIMIT);
  }, [meals]);

  const max = ranked.length ? ranked[0][1].count : 1;

  return (
    <View className="gap-3">
      <SectionHeader
        title={t('healthReport.topFoodsTitle')}
        subtitle={t('healthReport.topFoodsSubtitle')}
      />
      <ChartCard>
        {ranked.length === 0 ? (
          <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted text-center py-4">
            {t('healthReport.topFoodsEmpty')}
          </Text>
        ) : (
          <View className="gap-3">
            {ranked.map(([name, info]) => {
              const c = MEAL_QUALITY_COLOR[info.quality];
              return (
                <View key={name} className="gap-1.5">
                  <View className="flex-row items-center justify-between gap-3">
                    <Text
                      numberOfLines={1}
                      className="flex-1 font-body-medium text-[13px] text-ink dark:text-ink-dark">
                      {name}
                    </Text>
                    <Text className="font-body-bold text-[12px] tabular-nums" style={{ color: c }}>
                      {t('healthReport.timesSeen', { count: info.count })}
                    </Text>
                  </View>
                  <View className="h-1.5 rounded-pill overflow-hidden bg-border dark:bg-border-dark">
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ width: `${(info.count / max) * 100}%` }}
                      transition={{ type: 'timing', duration: 600 }}
                      style={{ height: '100%', borderRadius: 999, backgroundColor: c }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ChartCard>
    </View>
  );
}
