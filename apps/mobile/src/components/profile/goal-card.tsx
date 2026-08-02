import type { LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { accentLime, useThemeColors } from '@/theme';

export function GoalCard({
  Icon,
  title,
  desc,
  selected,
  onPress,
}: {
  Icon: LucideIcon;
  title: string;
  desc: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <PressableScale haptic="selection" accessibilityLabel={title} onPress={onPress}>
      <View
        className={`flex-row items-center gap-3 rounded-2xl p-3.5 border ${
          selected
            ? 'border-lime bg-lime/10'
            : 'bg-surface dark:bg-surface-raised-dark border-border dark:border-border-dark'
        }`}>
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: selected ? accentLime : `${accentLime}22` }}>
          <Icon size={20} color={selected ? colors.text : accentLime} />
        </View>
        <View className="flex-1">
          <Text className="font-heading text-[15px] text-ink dark:text-ink-dark">{title}</Text>
          <Text className="font-body text-[12.5px] text-ink-muted dark:text-ink-dark-muted">
            {desc}
          </Text>
        </View>
        <View
          className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
            selected ? 'border-lime' : 'border-border dark:border-border-dark'
          }`}>
          {selected && (
            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentLime }} />
          )}
        </View>
      </View>
    </PressableScale>
  );
}
