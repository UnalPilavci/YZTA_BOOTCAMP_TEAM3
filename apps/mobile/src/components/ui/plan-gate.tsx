import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { planOf, type PlanId } from '@/data/plans';
import { onAccentLime, useThemeColors } from '@/theme';

export function PlanGate({
  title,
  message,
  requiredPlan,
  ctaLabel,
  Icon = Lock,
}: {
  title: string;
  message: string;
  requiredPlan: PlanId;
  ctaLabel?: string;
  Icon?: LucideIcon;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const accent = planOf(requiredPlan).accent;
  const cta = ctaLabel ?? t('plans.gateCta', { plan: t(`plans.names.${requiredPlan}`) });

  return (
    <View className="flex-1 bg-cream dark:bg-surface-dark">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-row items-center px-4 pt-2 pb-1">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </PressableScale>
        </View>

        <View className="flex-1 items-center justify-center px-8 gap-3">
          <View
            className="w-20 h-20 rounded-3xl items-center justify-center mb-1"
            style={{ backgroundColor: `${accent}22` }}>
            <Icon size={34} color={accent} />
          </View>

          <Text className="font-heading text-xl text-ink dark:text-ink-dark text-center">
            {title}
          </Text>
          <Text className="font-body text-[14px] leading-[21px] text-ink-muted dark:text-ink-dark-muted text-center">
            {message}
          </Text>

          <PressableScale
            haptic="medium"
            accessibilityLabel={cta}
            onPress={() => router.push('/plans')}
            style={{ marginTop: 8, alignSelf: 'stretch' }}>
            <View
              className="rounded-2xl items-center justify-center"
              style={{ backgroundColor: accent, height: 52 }}>
              <Text className="font-heading text-[15px]" style={{ color: onAccentLime }}>
                {cta}
              </Text>
            </View>
          </PressableScale>
        </View>
      </SafeAreaView>
    </View>
  );
}
