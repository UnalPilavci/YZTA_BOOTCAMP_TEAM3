import { Plus, X } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { onAccentLime, useThemeColors } from '@/theme';

type Props = {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
};

export function AllergenChip({ label, emoji, selected, onPress }: Props) {
  return (
    <PressableScale
      haptic="selection"
      accessibilityLabel={label}
      onPress={onPress}>
      <View
        className={`flex-row items-center gap-1.5 h-11 rounded-pill px-4 border ${
          selected
            ? 'bg-lime border-lime'
            : 'bg-white dark:bg-surface-raised-dark border-border dark:border-border-dark'
        }`}>
        {emoji && <Text className="text-[15px]">{emoji}</Text>}
        <Text
          className={`font-body-medium text-sm ${
            selected ? 'text-lime-on' : 'text-ink dark:text-ink-dark'
          }`}>
          {label}
        </Text>
        {selected && <X size={14} color={onAccentLime} strokeWidth={2.5} />}
      </View>
    </PressableScale>
  );
}

export function AddAllergenChip({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <PressableScale haptic="light" accessibilityLabel={label} onPress={onPress}>
      <View
        className="flex-row items-center gap-1.5 h-11 rounded-pill px-4 border border-dashed border-ink-muted dark:border-ink-dark-muted"
        style={{ borderWidth: 1.5 }}>
        <Plus size={15} color={colors.textMuted} />
        <Text className="font-body-medium text-sm text-ink-muted dark:text-ink-dark-muted">
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}
