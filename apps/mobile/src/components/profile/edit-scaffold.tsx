import { Check, ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { accentLime, onAccentLime, useResolvedScheme, useThemeColors } from '@/theme';

type Props = {
  kicker: string;
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: ReactNode;
  footerAccessory?: ReactNode;
  saveLabel: string;
  onSave: () => void;
  saving?: boolean;
  saveDisabled?: boolean;
};

export function EditScaffold({
  kicker,
  title,
  subtitle,
  onBack,
  children,
  footerAccessory,
  saveLabel,
  onSave,
  saving,
  saveDisabled,
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
          <View className="flex-row items-center mt-3">
            <PressableScale haptic="selection" accessibilityLabel="Back" onPress={onBack}>
              <ChevronLeft size={24} color={colors.text} />
            </PressableScale>
          </View>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="grow px-5 pt-5 pb-4">
            <Text className="font-display text-[28px] leading-9 tracking-tight text-ink dark:text-ink-dark">
              {title}
            </Text>
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
              disabled={saving || saveDisabled}
              accessibilityLabel={saveLabel}
              onPress={onSave}>
              <View
                className="flex-row items-center justify-center gap-2 h-[54px] rounded-xl bg-[#101410] dark:bg-lime"
                style={{ opacity: saveDisabled ? 0.5 : 1 }}>
                {saving ? (
                  <ActivityIndicator color={isDark ? onAccentLime : accentLime} />
                ) : (
                  <>
                    <Text className="font-heading text-base text-lime dark:text-lime-on">
                      {saveLabel}
                    </Text>
                    <Check size={20} color={isDark ? onAccentLime : accentLime} />
                  </>
                )}
              </View>
            </PressableScale>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
