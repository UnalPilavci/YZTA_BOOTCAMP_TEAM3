import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { useThemeColors } from '@/theme';

export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-2.5">
      <Text className="font-body-medium text-[12px] tracking-wider uppercase text-ink-muted dark:text-ink-dark-muted ml-1">
        {title}
      </Text>
      <View className="rounded-2xl overflow-hidden bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
        {children}
      </View>
    </View>
  );
}

export function SettingsRow({
  Icon,
  label,
  onPress,
  children,
}: {
  Icon: LucideIcon;
  label: string;
  onPress?: () => void;
  children?: ReactNode;
}) {
  const colors = useThemeColors();
  const body = (
    <View className="flex-row items-center gap-3 px-4 h-14">
      <Icon size={19} color={colors.text} />
      <Text className="flex-1 font-body-medium text-[15px] text-ink dark:text-ink-dark">
        {label}
      </Text>
      {children}
    </View>
  );
  if (!onPress) return body;
  return (
    <PressableScale haptic="selection" accessibilityLabel={label} onPress={onPress}>
      {body}
    </PressableScale>
  );
}

export function SettingsDivider() {
  return <View className="h-px bg-border dark:bg-border-dark ml-14" />;
}

export function SettingsChevron() {
  const colors = useThemeColors();
  return <ChevronRight size={18} color={colors.textMuted} />;
}

export function SettingsSoonBadge({ label }: { label: string }) {
  return (
    <View className="rounded-pill px-2 py-0.5 bg-cream dark:bg-surface-dark border border-border dark:border-border-dark">
      <Text className="font-body-bold text-[10px] tracking-wider text-ink-muted dark:text-ink-dark-muted">
        {label}
      </Text>
    </View>
  );
}
