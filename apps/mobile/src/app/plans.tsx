import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Reveal } from '@/components/ui/reveal';
import { PLANS, PLAN_ORDER, type PlanDef, type PlanId } from '@/data/plans';
import { useScanQuota } from '@/hooks/use-plan';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { accentLime, onAccentLime, useThemeColors } from '@/theme';

export default function PlansScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();

  const current = useProfile((s) => s.plan);
  const quota = useScanQuota();
  const [busy, setBusy] = useState<PlanId | null>(null);

  const apply = async (next: PlanId) => {
    const userId = useAuth.getState().userId;
    if (!userId || busy) return;
    const previous = useProfile.getState().plan;
    useProfile.getState().setPlan(next);
    setBusy(next);
    try {
      await useProfile.getState().saveToServer(userId);
    } catch {
      useProfile.getState().setPlan(previous);
      Alert.alert(t('plans.saveFailed'));
    } finally {
      setBusy(null);
    }
  };

  const choose = (plan: PlanDef) => {
    if (plan.id === current) return;
    const name = t(`plans.names.${plan.id}`);
    Alert.alert(
      t('plans.confirmTitle', { plan: name }),
      plan.priceMonthly === 0
        ? t('plans.confirmDowngrade')
        : t('plans.confirmMessage', { price: plan.priceMonthly }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('plans.confirmCta'), onPress: () => void apply(plan.id) },
      ],
    );
  };

  return (
    <View className="flex-1 bg-cream dark:bg-surface-dark">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-1">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </PressableScale>
          <Text className="font-heading text-2xl tracking-tight text-ink dark:text-ink-dark">
            {t('plans.title')}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pt-2 pb-10 gap-4">
          <Text className="font-body text-[14px] leading-[21px] text-ink-muted dark:text-ink-dark-muted">
            {t('plans.subtitle')}
          </Text>

          <Reveal index={0}>
            <QuotaCard
              used={quota.used}
              limit={quota.limit}
              period={quota.plan.scanPeriod}
              resetsAt={quota.resetsAt}
            />
          </Reveal>

          {PLAN_ORDER.map((id, i) => (
            <Reveal key={id} index={i + 1}>
              <PlanCard
                plan={PLANS[id]}
                current={id === current}
                busy={busy === id}
                onPress={() => choose(PLANS[id])}
              />
            </Reveal>
          ))}

          <Text className="font-body text-[12px] leading-[18px] text-ink-muted dark:text-ink-dark-muted text-center px-2">
            {t('plans.billingNote')}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function QuotaCard({
  used,
  limit,
  period,
  resetsAt,
}: {
  used: number;
  limit: number;
  period: 'week' | 'month';
  resetsAt: number | null;
}) {
  const { t, i18n } = useTranslation();
  const ratio = limit > 0 ? Math.min(1, used / limit) : 1;
  const exhausted = used >= limit;

  return (
    <View className="rounded-3xl p-4 gap-3 bg-[#101410]">
      <View className="flex-row items-center justify-between">
        <Text className="font-heading text-[15px] text-white">{t('plans.quotaTitle')}</Text>
        <Text className="font-body text-[12px] text-white/60">
          {t(period === 'week' ? 'plans.periodWeek' : 'plans.periodMonth')}
        </Text>
      </View>

      <Text className="font-display text-[28px] text-lime tabular-nums">
        {t('plans.quotaUsed', { used, limit })}
      </Text>

      <View className="h-2 rounded-pill overflow-hidden bg-white/12">
        <View
          className="h-2 rounded-pill"
          style={{
            width: `${ratio * 100}%`,
            backgroundColor: exhausted ? '#DB4C40' : accentLime,
          }}
        />
      </View>

      <Text className="font-body text-[12px] text-white/60">
        {exhausted
          ? resetsAt
            ? t('plans.quotaResets', {
                date: new Date(resetsAt).toLocaleDateString(i18n.language, {
                  day: 'numeric',
                  month: 'long',
                }),
              })
            : t('plans.quotaExhausted')
          : t('plans.quotaRemaining', { remaining: limit - used })}
      </Text>
    </View>
  );
}

function PlanCard({
  plan,
  current,
  busy,
  onPress,
}: {
  plan: PlanDef;
  current: boolean;
  busy: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const Icon = plan.Icon;
  const recommended = plan.id === 'premium' && !current;

  return (
    <View
      className="rounded-3xl p-4 gap-3.5 bg-surface dark:bg-surface-raised-dark border"
      style={{ borderColor: current ? plan.accent : colors.border, borderWidth: current ? 2 : 1 }}>
      <View className="flex-row items-center gap-3">
        <View
          className="w-11 h-11 rounded-2xl items-center justify-center"
          style={{ backgroundColor: `${plan.accent}22` }}>
          <Icon size={21} color={plan.accent} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-heading text-[17px] text-ink dark:text-ink-dark">
              {t(`plans.names.${plan.id}`)}
            </Text>
            {current && (
              <View
                className="rounded-pill px-2 py-0.5"
                style={{ backgroundColor: `${plan.accent}22` }}>
                <Text
                  className="font-body-bold text-[10px] tracking-wider"
                  style={{ color: plan.accent }}>
                  {t('plans.currentBadge')}
                </Text>
              </View>
            )}
            {recommended && (
              <View className="flex-row items-center gap-1 rounded-pill px-2 py-0.5 bg-lime">
                <Sparkles size={10} color={onAccentLime} />
                <Text
                  className="font-body-bold text-[10px] tracking-wider"
                  style={{ color: onAccentLime }}>
                  {t('plans.recommendedBadge')}
                </Text>
              </View>
            )}
          </View>
          <Text className="font-body text-[12.5px] text-ink-muted dark:text-ink-dark-muted mt-0.5">
            {t(`plans.taglines.${plan.id}`)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-baseline gap-1.5">
        <Text className="font-display text-[26px] text-ink dark:text-ink-dark tabular-nums">
          {plan.priceMonthly === 0 ? t('plans.priceFree') : `₺${plan.priceMonthly}`}
        </Text>
        {plan.priceMonthly > 0 && (
          <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">
            {t('plans.perMonth')}
          </Text>
        )}
      </View>

      <View className="gap-2">
        {plan.perkKeys.map((key) => (
          <View key={key} className="flex-row items-start gap-2.5">
            <View
              className="w-5 h-5 rounded-full items-center justify-center mt-px"
              style={{ backgroundColor: `${plan.accent}22` }}>
              <Check size={12} color={plan.accent} strokeWidth={3} />
            </View>
            <Text className="flex-1 font-body text-[13.5px] leading-[20px] text-ink dark:text-ink-dark">
              {t(`plans.perks.${key}`)}
            </Text>
          </View>
        ))}
      </View>

      {current ? (
        <View className="h-12 rounded-2xl items-center justify-center bg-cream dark:bg-surface-dark border border-border dark:border-border-dark">
          <Text className="font-heading text-[14px] text-ink-muted dark:text-ink-dark-muted">
            {t('plans.currentCta')}
          </Text>
        </View>
      ) : (
        <PressableScale
          haptic="medium"
          accessibilityLabel={t(`plans.names.${plan.id}`)}
          onPress={onPress}>
          <View
            className="h-12 rounded-2xl items-center justify-center"
            style={{ backgroundColor: plan.accent }}>
            {busy ? (
              <ActivityIndicator color={onAccentLime} />
            ) : (
              <Text className="font-heading text-[14px]" style={{ color: onAccentLime }}>
                {plan.priceMonthly === 0 ? t('plans.downgradeCta') : t('plans.selectCta')}
              </Text>
            )}
          </View>
        </PressableScale>
      )}
    </View>
  );
}
