import { ChevronLeft, X, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { accentLime, onAccentLime, useResolvedScheme, useThemeColors } from '@/theme';

type Props = {
  kicker: string;
  step: number;
  totalSteps: number;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  backIcon?: 'chevron' | 'close';
  children: ReactNode;
  footerAccessory?: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  PrimaryIcon?: LucideIcon;
};

export function RegisterScaffold({
  kicker,
  step,
  totalSteps,
  title,
  subtitle,
  onBack,
  backIcon = 'chevron',
  children,
  footerAccessory,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  PrimaryIcon,
}: Props) {
  const colors = useThemeColors();
  const isDark = useResolvedScheme() === 'dark';

  return (
    <View className="flex-1 bg-surface dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="px-5 pt-2">
          <Text className="text-center font-body-medium text-[11px] tracking-[2px] text-ink-muted dark:text-ink-dark-muted">
            {kicker}
          </Text>
          <View className="flex-row items-center gap-3 mt-3">
            {onBack ? (
              <PressableScale
                haptic="selection"
                accessibilityLabel={backIcon === 'close' ? 'Close' : 'Back'}
                onPress={onBack}>
                {backIcon === 'close' ? (
                  <X size={24} color={colors.text} />
                ) : (
                  <ChevronLeft size={24} color={colors.text} />
                )}
              </PressableScale>
            ) : (
              <View className="w-6" />
            )}
            <View className="flex-1 h-1.5 rounded-full overflow-hidden bg-border dark:bg-border-dark">
              <View
                className="h-full rounded-full bg-lime"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </View>
            <Text className="font-body-medium text-xs text-ink-muted dark:text-ink-dark-muted">
              {step}/{totalSteps}
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="grow px-5 pt-5 pb-4">
            {title && (
              <Text className="font-display text-[28px] leading-9 tracking-tight text-ink dark:text-ink-dark">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text className="font-body text-sm text-ink-muted dark:text-ink-dark-muted mt-1.5">
                {subtitle}
              </Text>
            )}
            <View className="mt-6">{children}</View>
          </ScrollView>

          <View className="px-5 pb-2 pt-1">
            {footerAccessory}
            <PressableScale
              haptic="medium"
              disabled={primaryDisabled}
              accessibilityLabel={primaryLabel}
              onPress={onPrimary}>
              <View className="flex-row items-center justify-center gap-2 h-[54px] rounded-xl bg-[#101410] dark:bg-lime">
                <Text className="font-heading text-base text-lime dark:text-lime-on">
                  {primaryLabel}
                </Text>
                {PrimaryIcon && (
                  <PrimaryIcon size={20} color={isDark ? onAccentLime : accentLime} />
                )}
              </View>
            </PressableScale>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
