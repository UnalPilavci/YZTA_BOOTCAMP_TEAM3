import { useFocusEffect, useRouter } from 'expo-router';
import {
  AlertCircle,
  Bell,
  Bookmark,
  BookOpen,
  ChevronRight,
  Crown,
  Heart,
  History,
  Lightbulb,
  Ruler,
  ScanLine,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnnouncementBanner } from '@/components/app-config/announcement-banner';
import { useRealtimeInsert } from '@/hooks/use-realtime';
import { countUnreadNotifications } from '@/services/supabase/notifications';
import { useAuth } from '@/store/auth';
import { Card } from '@/components/ui/card';
import { DualScoreRing } from '@/components/ui/dual-score-ring';
import { PeriodToggle } from '@/components/ui/period-toggle';
import { Pill } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PulseLine } from '@/components/ui/pulse-line';
import { Reveal } from '@/components/ui/reveal';
import { periodCutoff, type ReportPeriod } from '@/data/report-period';
import { useMeals } from '@/store/meals';
import { useProfile } from '@/store/profile';
import { useScans, type ScanRecord } from '@/store/scans';
import { accentLime, accentMeal, getScore, onAccentLime, useThemeColors } from '@/theme';

type QuickTile = {
  labelKey: string;
  Icon: typeof AlertCircle;
  href:
    | '/edit-allergens'
    | '/insights'
    | '/dictionary'
    | '/diary'
    | '/health-report'
    | '/saved'
    | '/search'
    | '/history'
    | '/edit-goal'
    | '/scan'
    | '/edit-body'
    | '/plans';
};

const QUICK_ACTIONS: QuickTile[] = [
  { labelKey: 'home.qa.scan', Icon: ScanLine, href: '/scan' },
  { labelKey: 'home.qa.allergies', Icon: AlertCircle, href: '/edit-allergens' },
  { labelKey: 'home.qa.diary', Icon: UtensilsCrossed, href: '/diary' },
  { labelKey: 'home.qa.report', Icon: Heart, href: '/health-report' },
  { labelKey: 'home.qa.saved', Icon: Bookmark, href: '/saved' },
  { labelKey: 'home.qa.trends', Icon: TrendingUp, href: '/insights' },
  { labelKey: 'home.qa.dictionary', Icon: BookOpen, href: '/dictionary' },
  { labelKey: 'home.qa.search', Icon: Search, href: '/search' },
  { labelKey: 'home.qa.body', Icon: Ruler, href: '/edit-body' },
  { labelKey: 'home.qa.history', Icon: History, href: '/history' },
  { labelKey: 'home.qa.goal', Icon: Target, href: '/edit-goal' },
  { labelKey: 'home.qa.plans', Icon: Crown, href: '/plans' },
];

const QUICK_TILE_WIDTH = 104;
const QUICK_TILE_HEIGHT = 116;

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const name = useProfile((s) => s.name);
  const scans = useScans((s) => s.scans);
  const recent = scans.slice(0, 5);
  const userId = useAuth((s) => s.userId);

  const [unread, setUnread] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const myId = useAuth.getState().userId;
      if (!myId) return;
      void countUnreadNotifications(myId)
        .then((n) => active && setUnread(n))
        .catch(() => {});
      return () => {
        active = false;
      };
    }, []),
  );

  useRealtimeInsert<{ user_id: string }>({
    channelName: 'home-notif',
    table: 'notifications',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
    onInsert: () => setUnread((n) => n + 1),
  });

  return (
    <View className="flex-1 bg-cream dark:bg-surface-dark">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pb-16 gap-4">
          <Reveal index={0}>
            <View className="gap-3 pt-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-heading text-2xl tracking-tight text-ink dark:text-ink-dark">
                  nutriLens
                </Text>
                <BellButton count={unread} onPress={() => router.push('/notifications')} />
              </View>
              <PulseLine />
              <View>
                <Text className="font-body text-sm text-ink-muted dark:text-ink-dark-muted">
                  {name ? t('home.greetingNamed', { name }) : t('home.greetingAnon')}
                </Text>
                <Text className="font-heading text-2xl tracking-tight text-ink dark:text-ink-dark">
                  {t('home.subtitle')}
                </Text>
              </View>
            </View>
          </Reveal>

          <AnnouncementBanner />

          <Reveal index={1}>
            <HealthReportCard />
          </Reveal>

          <Reveal index={2}>
            <PressableScale
              haptic="light"
              accessibilityLabel={t('diary.title')}
              onPress={() => router.push('/diary')}>
              <View className="flex-row items-center gap-3 rounded-2xl p-3.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center"
                  style={{ backgroundColor: `${accentMeal}22` }}>
                  <UtensilsCrossed size={18} color={accentMeal} />
                </View>
                <View className="flex-1">
                  <Text className="font-heading text-[15px] text-ink dark:text-ink-dark">
                    {t('diary.homeTitle')}
                  </Text>
                  <Text className="font-body text-[12.5px] text-ink-muted dark:text-ink-dark-muted">
                    {t('diary.homeSubtitle')}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </View>
            </PressableScale>
          </Reveal>

          <Reveal index={2}>
            <View className="gap-3">
              <Text className="font-heading text-lg text-ink dark:text-ink-dark">
                {t('home.quickAccess')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-3 pr-1">
                {QUICK_ACTIONS.map((tile) => (
                  <QuickAction key={tile.labelKey} tile={tile} />
                ))}
              </ScrollView>
            </View>
          </Reveal>

          <Reveal index={3}>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-heading text-lg text-ink dark:text-ink-dark">
                  {t('home.recentScans')}
                </Text>
                {recent.length > 0 && (
                  <PressableScale
                    haptic="selection"
                    onPress={() => router.push('/history')}>
                    <Text className="font-body-medium text-sm text-ink-muted dark:text-ink-dark-muted">
                      {t('common.all')} →
                    </Text>
                  </PressableScale>
                )}
              </View>
              {recent.length === 0 ? (
                <RecentEmpty onPress={() => router.push('/scan')} />
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-3 py-1">
                  {recent.map((s) => (
                    <RecentScanCard
                      key={s.id}
                      record={s}
                      onPress={() =>
                        router.push({ pathname: '/result', params: { id: s.id } })
                      }
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          </Reveal>

          <Reveal index={4}>
            <TipCard onPress={() => router.push('/daily-tip')} />
          </Reveal>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function BellButton({ count, onPress }: { count: number; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <PressableScale
      haptic="light"
      accessibilityLabel={t('home.notifications', { count })}
      onPress={onPress}
      style={{ width: 44, height: 44 }}>
      <View className="w-11 h-11 rounded-full items-center justify-center bg-[#101410] dark:bg-surface-raised-dark">
        <Bell size={18} color={accentLime} />
        {count > 0 && (
          <View
            className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full px-1 items-center justify-center"
            style={{ backgroundColor: accentLime }}>
            <Text className="font-body-bold text-[10px] leading-3" style={{ color: onAccentLime }}>
              {count > 99 ? '99+' : count}
            </Text>
          </View>
        )}
      </View>
    </PressableScale>
  );
}

function HealthReportCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const scans = useScans((s) => s.scans);
  const meals = useMeals((s) => s.meals);
  const [period, setPeriod] = useState<ReportPeriod>('week');

  const consumedScans = useMemo(() => scans.filter((s) => s.consumed), [scans]);
  const periodScans = useMemo(() => {
    const cutoff = periodCutoff(period);
    return consumedScans.filter((s) => s.createdAt >= cutoff);
  }, [consumedScans, period]);

  const periodMeals = useMemo(() => {
    const cutoff = periodCutoff(period);
    return meals.filter((m) => m.createdAt >= cutoff);
  }, [meals, period]);

  const count = periodScans.length;
  const avg = count
    ? Math.round(periodScans.reduce((sum, r) => sum + r.healthScore, 0) / count)
    : 0;
  const mealCount = periodMeals.length;
  const mealAvg = mealCount
    ? Math.round(periodMeals.reduce((sum, m) => sum + m.mealScore, 0) / mealCount)
    : 0;
  const hasData = count > 0 || mealCount > 0;
  const { color: scoreColor } = getScore(avg);

  return (
    <View>
      <MotiView
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -8,
          left: -8,
          right: -8,
          bottom: -8,
          borderRadius: 32,
          backgroundColor: scoreColor,
        }}
        from={{ opacity: 0.08, scale: 0.98 }}
        animate={{ opacity: 0.2, scale: 1.02 }}
        transition={{ type: 'timing', duration: 2600, loop: true }}
      />
      <PressableScale
        haptic="light"
        accessibilityLabel={t('home.heroKicker')}
        onPress={() => router.push({ pathname: '/health-report', params: { period } })}>
        <View className="flex-row items-center justify-between p-6 rounded-[28px] bg-[#101410] dark:bg-surface-dark dark:border dark:border-border-dark">
          <View className="flex-1 gap-2">
            <PeriodToggle value={period} onChange={setPeriod} />
            <View className="flex-row items-center gap-1.5 mt-1">
              <ShieldCheck size={16} color="#FFFFFF" />
              <Text className="font-heading text-base text-white">
                {t('home.heroKicker')}
              </Text>
            </View>
            {hasData ? (
              <>
                <Text className="font-body text-[13px] text-white/85">
                  {t(period === 'week' ? 'home.heroAvgWeek' : 'home.heroAvgMonth')}
                </Text>
                <View className="gap-1 mt-0.5">
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentLime }} />
                    <Text className="font-body-medium text-xs" style={{ color: accentLime }}>
                      {t('home.productScans', { count })}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentMeal }} />
                    <Text className="font-body-medium text-xs" style={{ color: accentMeal }}>
                      {t('home.mealScans', { count: mealCount })}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <Text className="font-body text-[13px] text-white/85">
                {consumedScans.length > 0 || meals.length > 0
                  ? t('home.heroEmptyPeriod')
                  : t('home.heroEmpty')}
              </Text>
            )}
          </View>
          {hasData && <DualScoreRing productScore={avg} mealScore={mealAvg} size={112} />}
        </View>
      </PressableScale>
    </View>
  );
}

function QuickAction({ tile }: { tile: QuickTile }) {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const Icon = tile.Icon;

  return (
    <PressableScale
      haptic="light"
      accessibilityLabel={t(tile.labelKey)}
      onPress={() => router.push(tile.href)}
      style={{ width: QUICK_TILE_WIDTH }}>
      <Card
        className="items-center justify-center gap-2.5 px-2"
        elevation="none"
        style={{ width: QUICK_TILE_WIDTH, height: QUICK_TILE_HEIGHT }}>
        <Icon size={24} color={colors.text} />
        <Text
          numberOfLines={2}
          className="font-body-medium text-sm text-center text-ink dark:text-ink-dark">
          {t(tile.labelKey)}
        </Text>
      </Card>
    </PressableScale>
  );
}

function RecentEmpty({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  return (
    <PressableScale haptic="light" onPress={onPress}>
      <Card className="flex-row items-center gap-4 p-4">
        <View className="w-11 h-11 rounded-full items-center justify-center bg-brand-tint dark:bg-brand-dark-tint">
          <ScanLine size={24} color={colors.brand} />
        </View>
        <View className="flex-1">
          <Text className="font-body-medium text-sm text-ink dark:text-ink-dark mb-0.5">
            {t('home.recentEmptyTitle')}
          </Text>
          <Text className="font-body-bold text-[13px] text-brand dark:text-brand-dark">
            {t('home.recentEmptyCta')} →
          </Text>
        </View>
      </Card>
    </PressableScale>
  );
}

function RecentScanCard({
  record,
  onPress,
}: {
  record: ScanRecord;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { grade, color } = getScore(record.healthScore);
  const name = record.productName ?? t('common.unknownProduct');
  return (
    <PressableScale haptic="light" onPress={onPress}>
      <Card className="w-[150px] p-3 gap-2">
        <View
          className="w-full h-[72px] rounded-xl items-center justify-center"
          style={{ backgroundColor: `${color}22` }}>
          <UtensilsCrossed size={26} color={color} />
        </View>
        <Text
          numberOfLines={2}
          className="font-body-medium text-[13px] text-ink dark:text-ink-dark min-h-[34px]">
          {name}
        </Text>
        <Pill label={`${grade} · ${record.healthScore}`} tone="neutral" />
      </Card>
    </PressableScale>
  );
}

function TipCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  return (
    <PressableScale haptic="light" onPress={onPress}>
      <View className="flex-row items-center gap-4 rounded-2xl p-4 bg-[#FDF3E1] dark:bg-[#2E2410]">
        <View className="w-10 h-10 rounded-full items-center justify-center bg-[#F2A73B]">
          <Lightbulb size={20} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text className="font-heading text-[15px] text-ink dark:text-ink-dark mb-0.5">
            {t('home.tipTitle')}
          </Text>
          <Text
            numberOfLines={2}
            className="font-body text-[13px] leading-[18px] text-ink-muted dark:text-ink-dark-muted">
            {t('home.tipText')}
          </Text>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </View>
    </PressableScale>
  );
}
