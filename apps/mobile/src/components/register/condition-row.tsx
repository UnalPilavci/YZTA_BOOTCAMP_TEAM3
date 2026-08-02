import { Check, type LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { accentLime, onAccentLime, useResolvedScheme, useThemeColors } from '@/theme';

type Props = {
  label: string;
  Icon: LucideIcon;
  selected: boolean;
  onPress: () => void;
};

export function ConditionRow({ label, Icon, selected, onPress }: Props) {
  const colors = useThemeColors();
  const isDark = useResolvedScheme() === 'dark';
  const accentOnRow = isDark ? onAccentLime : accentLime;

  return (
    <PressableScale
      haptic="selection"
      accessibilityLabel={label}
      onPress={onPress}>
      <View
        className={`flex-row items-center gap-3 h-16 rounded-2xl px-4 border ${
          selected
            ? 'bg-[#101410] dark:bg-lime border-transparent'
            : 'bg-white dark:bg-surface-raised-dark border-border dark:border-border-dark'
        }`}>
        <Icon size={22} color={selected ? accentOnRow : colors.textMuted} />
        <Text
          className={`flex-1 font-body-medium text-[15px] ${
            selected
              ? 'text-white dark:text-lime-on'
              : 'text-ink dark:text-ink-dark'
          }`}>
          {label}
        </Text>
        <View
          className={`w-6 h-6 rounded-md items-center justify-center ${
            selected
              ? 'bg-lime dark:bg-[#0C0F0C]'
              : 'border-2 border-border dark:border-border-dark'
          }`}>
          {selected && (
            <Check size={15} color={isDark ? accentLime : onAccentLime} strokeWidth={3} />
          )}
        </View>
      </View>
    </PressableScale>
  );
}
